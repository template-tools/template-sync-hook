import { Service } from "@kronos-integration/service";
import { ServiceHTTP } from "@kronos-integration/service-http";
import { GithubHookInterceptor } from "@kronos-integration/interceptor-webhook";
import { ServiceRepositories } from "@kronos-integration/service-repositories";

import { Context } from "npm-template-sync";

export default async function initialize(sp) {
  const secret = "the secret";

  await sp.declareServices({
    http: {
      type: ServiceHTTP,
      autostart: true,
      endpoints: {
        "POST:/webhook": {
          interceptors: [GithubHookInterceptor, /*CTXInterceptor,*/ new GithubHookInterceptor({ secret })],
          connected: "service(webhook).push"
        }
      }
    },
    repositories: {
      type: ServiceRepositories,
      autostart: true,
      providers: [
        {
          type: "github-repository-provider"
        }
      ]
    },
    webhook: {
      type: Webhook,
      autostart: true
    }
  });

  await sp.start();

  console.log(await sp.services.http.endpoints["POST:/webhook"]);
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
    console.log("REQUEST", request);

    if (request.repository) {
      const context = await Context.from(
        this.owner.services.repositories.providers,
        request.repository.full_name,
        options
      );

      context.execute();
    }
  }
}
