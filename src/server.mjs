
import { createServer as httpCreateServer } from "http";
import { createServer as httpsCreateServer } from "https";

import Koa from "koa";

import Router from "koa-better-router";
import { createGithubHookHandler } from "koa-github-hook-handler";
import { PreparedContext } from "npm-template-sync";


export const defaultServerConfig =
{
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

  const server = config.http.cert
    ? httpsCreateServer(config.http, app.callback())
    : httpCreateServer(app.callback());
  server.on("error", err => console.log(err));
  const router = Router();

  router.addRoute(
    "POST",
    config.http.hook.path,
    createGithubHookHandler(
      {
        push: async request => {
          console.log("push", request.repository.full_name);
          const pullRequest = await PreparedContext.execute(
            context,
            request.repository.full_name
          );

          console.log("Generated %s", pullRequest);
          return { pr: pullRequest };
        },
        ping: async request => {
          console.log(
            "Received a ping event for %s",
            request.repository.full_name
          );
          return { ok: true };
        }
      },
      config.http.hook
    )
  );

  app.use(router.middleware());

  const listener = app.listen(config.http.port, () => {
    console.log("listen on", listener.address());
    sd.notify("READY=1\nSTATUS=running");
  });

  return server;
}
