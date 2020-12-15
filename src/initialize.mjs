import { Service } from "@kronos-integration/service";
import { ServiceHTTP } from "@kronos-integration/service-http";
import { GithubHookInterceptor } from "@kronos-integration/interceptor-webhook";
import { ServiceRepositories } from "@kronos-integration/service-repositories";

import { Context } from "npm-template-sync";

export default async function initialize(sp) {
  const secret = process.env.WEBHOOK_SECRET;

  await sp.declareServices({
    http: {
      type: ServiceHTTP,
      autostart: true,
      endpoints: {
        "POST:/webhook": {
          interceptors: [ new GithubHookInterceptor({ secret })],
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

  //console.log(await sp.services.http.endpoints["POST:/webhook"]);
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

  async push(request,b,c) {
   // console.log("REQUEST", request,b,c);

    if (request.repository) {
      const options = {};
      const context = await Context.from(
        this.owner.services.repositories.provider,
        request.repository.full_name,
        options
      );

      const pullRequests = [];
      for await (const pr of context.execute()) {
        pullRequests.push(pr.identifier);
      }
      
      return { pullRequests };
    }
  }
}
