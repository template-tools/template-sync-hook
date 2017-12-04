import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

const external = [];

export default [
  {
    output: {
      file: pkg.bin['npm-template-sync-github-hook'],
      format: 'cjs',
      banner: '#!/usr/bin/env node'
    },
    plugins: [nodeResolve(), commonjs()],
    external,
    input: 'src/npm-template-sync-github-hook.js'
  }
];
