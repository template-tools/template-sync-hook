import Koa from "koa";
import Router from "koa-better-router";
import { createGithubHookHandler } from "koa-github-hook-handler";
import { PreparedContext } from "npm-template-sync";

export const defaultServerConfig = {
  autostop: false,
  http: {
    port: "${first(env.PORT,8093)}",
    hook: {
      path: "/webhook",
      secret: "${env.WEBHOOK_SECRET}"
    }
  }
};

export async function createServer(config, sd, context) {
  const app = new Koa();

  const router = Router();

  function shutdown() {
    if (ongoing.size === 0) {
      sd.notify("STOPPING=1\nSTATUS=stopping");
      server.unref();
    }
  }

  process.on("SIGINT", () => shutdown());

  router.addRoute("POST", "/admin/stop", (ctx, next) => {
    shutdown();
    next();
  });

  router.addRoute("POST", "/admin/reload", async (ctx, next) => {
    sd.notify("RELOADING=1");
    // TODO
    return next();
  });

  const ongoing = new Set();

  function addOngoing(p) {
    p.finally(() => {
      ongoing.delete(p);
      if(config.autostop) {
        shutdown();
      }
    });
    ongoing.add(p);
  }

  router.addRoute(
    "POST",
    config.http.hook.path,
    createGithubHookHandler(
      {
        push: async request => {
          console.log("push", request.repository.full_name);

          const pc = await PreparedContext.from(context, request.repository.full_name);
 
          addOngoing(pc.execute());

          return { pullRequest: "ongoing", queuedAt: ongoing.size };
        },
        ping: async request => {
          console.log("ping", request.repository.full_name);

          return { ok: true };
        }
      },
      config.http.hook
    )
  );

  app.use(router.middleware());

  const server = app.listen(config.http.port, () => {
    console.log("listen on", server.address());
    sd.notify("READY=1\nSTATUS=running");
  });

  return server;
}
