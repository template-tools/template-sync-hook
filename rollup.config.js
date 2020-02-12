import resolve from '@rollup/plugin-node-resolve';
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

import executable from "rollup-plugin-executable";
import cleanup from "rollup-plugin-cleanup";
import consts from "rollup-plugin-consts";
import builtins from "builtin-modules";

import { name, version, description, main, module, bin } from "./package.json";

const external = [...builtins,    "universal-user-agent",
"@octokit/rest",
"@octokit/plugin-throttling",
"node-fetch",
"sd-daemon",
"koa",
"koa-better-router"
];
const extensions = ["js", "mjs", "jsx", "tag"];
const plugins = [
  commonjs(),
  resolve(),
  json(),
  consts({
    name,
    version,
    description
  }),
  cleanup({
    extensions
  })
];

const config = Object.keys(bin || {}).map(name => {
  return {
    input: `src/${name}-cli.mjs`,
    output: {
      plugins: [executable()],
      banner:
        '#!/bin/sh\n":" //# comment; exec /usr/bin/env node --experimental-modules --experimental-wasm-modules "$0" "$@"',
      file: bin[name]
    }
  };
});

if (module !== undefined && main !== undefined && module != main) {
  config.push({
    input: module,
    output: {
      file: main
    }
  });
}

export default config.map(c => {
  c.output = {
    interop: false,
    externalLiveBindings: false,
    format: "cjs",
    ...c.output
  };
  return { plugins, external, ...c };
});
