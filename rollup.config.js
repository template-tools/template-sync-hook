import cleanup from "rollup-plugin-cleanup";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import executable from "rollup-plugin-executable";
import pkg from "./package.json";

const external = [
  "os",
  "path",
  "crypto",
  "fs",
  "util",
  "url",
  "net",
  "tty",
  "stream",
  "child_process",
  "http",
  "https",
  "assert",
  "events",
  "zlib",
  "jsonpath",
  "deep-extend",
  "simple-diff",
  "micromatch",
  "semver",
  "caporal",
  "enquirer",
  "node-fetch"
];

export default {
  output: {
    file: pkg.bin["npm-template-sync-github-hook"],
    format: "cjs",
    banner:
      '#!/bin/sh\n":" //# comment; exec /usr/bin/env node --experimental-modules --experimental-worker "$0" "$@"',
    interop: false
  },
  plugins: [
    resolve(),
    commonjs(),
    json({
      preferConst: true,
      compact: true
    }),
    executable()
  ],
  external,
  input: pkg.module
};
