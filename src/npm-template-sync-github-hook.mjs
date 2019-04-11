import { Context, PreparedContext } from "npm-template-sync";
import { GithubProvider } from "github-repository-provider";
import createHandler from "github-webhook-handler";
import micro from "micro";
import program from "commander";
import { expand } from "config-expander";
import { version, description } from "../package.json";

program
  .version(version)
  .description(description)
  .option("-c, --config <dir>", "use config directory")
  .action(async () => {
    let sd = { notify: (...args) => console.log(...args), listener: () => [] };
    try {
      sd = await import("sd-daemon");
    } catch (e) {}
    sd.notify("READY=1\nSTATUS=starting");

    const config = await expand(configDir ? "${include('config.json')}" : {}, {
      constants: {
        basedir: configDir || process.cwd(),
        installdir: resolve(__dirname, "..")
      },
      default: {
        http: {
          port: "${first(env.PORT,8093)}"
        }
      }
    });

    const listeners = sd.listeners();
    if (listeners.length > 0) config.http.port = listeners[0];

    const context = new Context(
      new GithubProvider(GithubProvider.optionsFromEnvironment(process.env)),
      {
        logger: console
      }
    );

    const handler = createHandler({
      path: "/webhook",
      secret: process.env.WEBHOOK_SECRET
    });

    handler.on("error", err => console.error("Error:", err.message));

    handler.on("ping", async event => {
      console.log(
        "Received a ping event for %s",
        event.payload.repository.full_name
      );
    });

    handler.on("push", async event => {
      console.log(
        "Received a push event for %s to %s",
        event.payload.repository.full_name,
        event.payload.ref
      );

      try {
        const pullRequest = await PreparedContext.execute(
          context,
          event.payload.repository.full_name
        );

        console.log("Generated %s", pullRequest);
      } catch (e) {
        console.error(e);
      }
    });

    const server = micro(async (req, res) => {
      handler(req, res, err => {
        if (err) {
          console.log(err);
          res.writeHead(404);
          res.end("no such location");
        } else {
          res.writeHead(200);
          res.end("woot");
        }
      });
    });

    const listener = server.listen(port, () => {
      console.log("listen on", listener.address());
      sd.notify("READY=1\nSTATUS=running");
    });
  })
  .parse(process.argv);
