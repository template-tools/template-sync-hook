import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import executable from 'rollup-plugin-executable';
import pkg from './package.json';

const external = ['npm-template-sync', 'github-repository-provider'];

export default [
  {
    output: {
      file: pkg.bin['npm-template-sync-github-hook'],
      format: 'cjs',
      banner: '#!/usr/bin/env node',
      interop: false
    },
    plugins: [resolve(), commonjs(), executable()],
    external,
    input: 'src/npm-template-sync-github-hook.js'
  }
];
