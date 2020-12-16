import { Service } from "@kronos-integration/service";
import { Context } from "npm-template-sync";

export class ServiceHooks extends Service {
  static get name() {
    return "hooks";
  }

  static get endpoints() {
    return {
      ...super.endpoints,
      push: {
        receive: "push"
      }
    };
  }

  async push(request, type) {

    this.info(`got ${type} request`);

    switch (type) {
      case "ping":
        return { ok: true };

      case "push":
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

      default:
        throw new Error("unknown request");
    }
  }
}
