import cleanup from "rollup-plugin-cleanup";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import executable from "rollup-plugin-executable";
import pkg from "./package.json";

const external = [
  "assert",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "sys",
  "timers",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "zlib",

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
