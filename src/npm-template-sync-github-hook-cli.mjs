#!/bin/sh
":"; //# comment; exec /usr/bin/env node --experimental-modules --experimental-json-modules "$0" "$@"

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import program from "commander";
import { expand } from "config-expander";
import { removeSensibleValues } from "remove-sensible-values";
import { Context } from "npm-template-sync";
import { GithubProvider } from "github-repository-provider";
import { defaultServerConfig, createServer } from "./server.mjs";
import sd from "sd-daemon";
import pkg from "../package.json";

const here = dirname(fileURLToPath(import.meta.url));

program
  .version(pkg.version)
  .description(pkg.description)
  .option("-c, --config <dir>", "use config directory")
  .action(async () => {
    sd.notify("STATUS=starting");

    const configDir = process.env.CONFIGURATION_DIRECTORY || program.config;

    const config = await expand(configDir ? "${include('config.json')}" : {}, {
      constants: {
        basedir: configDir || process.cwd(),
        installdir: resolve(here, "..")
      },
      default: {
        ...defaultServerConfig
      }
    });

    const listeners = sd.listeners();
    if (listeners.length > 0) {
      config.http.port = listeners[0];
    }

    console.log(removeSensibleValues(config));

    const loggerOptions = {
      logger: console
    };

    const context = new Context(
      GithubProvider.initialize(undefined, process.env),
      loggerOptions
    );

    await createServer(config, sd, context);
  })
  .parse(process.argv);
