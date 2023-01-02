import esbuild from 'esbuild';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

esbuild.build({
  entryPoints : ['./background/index.js'],
  bundle      : true,
  platform    : 'browser',
  target      : ['chrome101'],
  outfile     : './dist/background/index.js',
  plugins     : [NodeGlobalsPolyfillPlugin(), NodeModulesPolyfillPlugin()],
  define      : {
    'global': 'globalThis'
  }
});