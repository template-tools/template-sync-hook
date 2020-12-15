import { ServiceHTTP } from "@kronos-integration/service-http";
import { GithubHookInterceptor } from "@kronos-integration/interceptor-webhook";
import { ServiceRepositories } from "@kronos-integration/service-repositories";
import { ServiceHooks } from "./service-hooks.mjs";

export default async function initialize(sp) {
  await sp.declareServices({
    http: {
      type: ServiceHTTP,
      autostart: true,
      endpoints: {
        "POST:/webhook": {
          interceptors: [
            new GithubHookInterceptor({ secret: process.env.WEBHOOK_SECRET })
          ],
          connected: "service(hooks).push"
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
    hooks: {
      type: ServiceHooks,
      autostart: true
    }
  });

  await sp.start();
}

