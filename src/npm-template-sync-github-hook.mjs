import { Service } from "@kronos-integration/service";
import { ServiceHTTP, CTXInterceptor } from "@kronos-integration/service-http";
import { GithubHookInterceptor } from "@kronos-integration/interceptor-webhook";
import { ServiceRepositories } from "@kronos-integration/service-repositories";

import { Context, Template } from "npm-template-sync";

export default async function initialize(sp) {

  const secret = "the secret";
  
  await sp.declareServices({
    http: {
      type: ServiceHTTP,
      autostart: true,
      endpoints: {
        "POST:/webhook": {
          interceptors: [new CTXInterceptor(), new GithubHookInterceptor({ secret })],
          connected: "service(webhook).push"
        }
      }
    },
    repositories: {
      type: ServiceRepositories,
      providers: [
        {
          type: "github-repository-provider"
        },
        {
          type: "bitbucket-repository-provider"
        }
      ]
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
    console.log(request);
    const context = await Context.from(
      this.owner.services.repositories.provider.providers,
      request.repository.full_name,
      options
    );

    context.execute();
  }
}
