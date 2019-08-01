import builtins from "builtin-modules";
import cleanup from "rollup-plugin-cleanup";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import executable from "rollup-plugin-executable";
import pkg from "./package.json";

const external = [
  ...builtins,
  "node-fetch",
  "sd-daemon",
  "koa",
  "koa-better-router"
];

export default {
  output: {
    file: pkg.bin["npm-template-sync-github-hook"],
    format: "cjs",
    banner:
      '#!/bin/sh\n":" //# comment; exec /usr/bin/env node --experimental-modules "$0" "$@"',
    interop: false,
    externalLiveBindings: false
  },
  plugins: [
    commonjs(),
    resolve(),
    json({
      preferConst: true,
      compact: true
    }),
    cleanup({
      extensions: ['js','mjs','jsx','tag']
    }),
    executable()
  ],
  external,
  input: pkg.module
};
