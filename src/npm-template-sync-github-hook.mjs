import { resolve } from "path";
import program from "commander";
import { version, description } from "../package.json";
import { expand, removeSensibleValues } from "config-expander";
import { Context } from "npm-template-sync";
import { GithubProvider } from "github-repository-provider";
import { defaultServerConfig, createServer } from "./server.mjs";

program
  .version(version)
  .description(description)
  .option("-c, --config <dir>", "use config directory")
  .action(async () => {
    let sd = { notify: () => {}, listeners: () => [] };
    try {
      sd = await import("sd-daemon");
    } catch (e) {}
    sd.notify("READY=1\nSTATUS=starting");

    const configDir = process.env.CONFIGURATION_DIRECTORY || program.config;

    const config = await expand(configDir ? "${include('config.json')}" : {}, {
      constants: {
        basedir: configDir || process.cwd(),
        installdir: resolve(__dirname, "..")
      },
      default: {
        ...defaultServerConfig
      }
    });

    const listeners = sd.listeners();
    if (listeners.length > 0) config.http.port = listeners[0];

    console.log(removeSensibleValues(config));

    const context = new Context(
      new GithubProvider(GithubProvider.optionsFromEnvironment(process.env)),
      {
        logger: console
      }
    );

    const server = await createServer(config, sd, context);
  })
  .parse(process.argv);
