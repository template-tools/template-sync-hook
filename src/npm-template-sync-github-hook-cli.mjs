#!/usr/bin/env node

import { readFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import program from "commander";
import { expand } from "config-expander";
import GithubProvider from "github-repository-provider";
import { defaultServerConfig, createServer } from "./server.mjs";
import sd from "sd-daemon";

const here = dirname(fileURLToPath(import.meta.url));

/*
const { version, description } = JSON.parse(
  readFileSync(
    join(here, "..", "package.json"),
    { encoding: "utf8" }
  )
);
*/

program
  //.version(version)
  //.description(description)
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

    await createServer(config, sd,
      GithubProvider.initialize(undefined, process.env),
      {
        logger: console
      }
      );
  })
  .parse(process.argv);
