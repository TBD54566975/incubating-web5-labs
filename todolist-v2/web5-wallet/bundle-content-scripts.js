import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ["./content-scripts/injector.js", "./content-scripts/web5.js"],
  bundle: true,
  target: ["chrome101"],
  outdir: "./dist/content-scripts"
})