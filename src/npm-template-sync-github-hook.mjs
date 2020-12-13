import { ServiceHTTP, CTXInterceptor } from "@kronos-integration/service-http";
import { GithubHookInterceptor } from "@kronos-integration/interceptor-webhook";

import { Context, Template } from "npm-template-sync";

export default async function initialize(sp) {
  await sp.declareServices({
    http: {
      type: ServiceHTTP,
      autostart: true,
      endpoints: {
        "POST:/webhook": {
          interceptors: [new CTXInterceptor(), new GithubHookInterceptor()],
          connected: "service(webhook).push"
        }
      }
    },
    webhook: {
      type: Webhook,
      autostart: true
    }
  });

  await sp.start();
}

class Webhook extends Service {
  static get name() {
    return "webhook";
  }
}

/*
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
*/
