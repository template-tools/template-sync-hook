import { ServiceHTTP } from "@kronos-integration/service-http";
import { GithubHookInterceptor } from "@kronos-integration/interceptor-webhook";
import { ServiceRepositories } from "@kronos-integration/service-repositories";
import { TemplateProcessor } from "./template-processor.mjs";

export default async function initialize(sp) {
  sp.registerFactories([
    GithubHookInterceptor,
    TemplateProcessor,
    ServiceRepositories,
    ServiceHTTP
  ]);

  await sp.declareServices({
    http: {
      autostart: true,
      endpoints: {
        "POST:/webhook": {
          interceptors: [
            {
              type: "github-webhook",
              secret: process.env.WEBHOOK_SECRET
            }
          ],
          connected: "service(template-processor).execute"
        }
      }
    },
    repositories: {
      providers: ["github-repository-provider"]
    },
    "template-processor": {
      autostart: true
    }
  });

  await sp.start();
}
