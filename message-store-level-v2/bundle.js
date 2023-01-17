import esbuild from 'esbuild';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

esbuild.build({
  entryPoints: ['./src/index.js'],
  bundle: true,
  platform: 'browser',
  sourcemap: true,
  target: ['chrome101'],
  outfile: './dist/browser.js',
  plugins: [NodeGlobalsPolyfillPlugin(), NodeModulesPolyfillPlugin()],
  define: {
    'global': 'globalThis'
  }
});