import esbuild from 'esbuild';
import browserConfig from './esbuild-browser-config.cjs';

esbuild.build({
  ...browserConfig,
  entryPoints : ['./src/common.ts', './src/alice.ts', './src/pfi.ts'],
  outdir      : 'dist',
});