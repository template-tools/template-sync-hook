import Koa from "koa";
import Router from "koa-better-router";
import { createGithubHookHandler } from "koa-github-hook-handler";
import { Context, Template } from "npm-template-sync";

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

export async function createServer(config, sd, provider, options) {
  const app = new Koa();
  const router = Router();
  let atWork = false;

  function shutdown() {
    if (!atWork) {
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

  router.addRoute(
    "POST",
    config.http.hook.path,
    createGithubHookHandler(
      {
        push: async request => {
          console.log("push", request.repository.full_name);

	  atWork = true;
          const context = await Context.from(provider, request.repository.full_name, options);

          const ongoing = [];
 
          for await(const pr of context.execute()) {
            ongoing.push(pr.identifier);
          } 

	  atWork = false;

          return { pullRequests: ongoing };
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
