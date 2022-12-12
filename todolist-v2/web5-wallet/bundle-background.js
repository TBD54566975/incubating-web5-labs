import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ["./background/index.js"],
  bundle: true,
  target: ["chrome58", "firefox57"],
  outfile: "./dist/background/index.js"
})