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
  static get endpoints() {
    return {
      ...super.endpoints,
      push: {
        receive: "push"
      }
    };
  }

  async push(request) {
    const context = await Context.from(provider, request.repository.full_name, options);

    context.execute();
  }
}
