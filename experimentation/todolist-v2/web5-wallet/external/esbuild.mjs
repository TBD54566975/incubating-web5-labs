import esbuild from "esbuild";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

esbuild.build({
	entryPoints: [ "./bundle.mjs" ],
	outfile: "../extension/external/bundle.mjs",
	platform: "browser",
	format: "esm",
	bundle: true,
	minify: true,
	plugins: [
		NodeGlobalsPolyfillPlugin(),
		NodeModulesPolyfillPlugin(),
	],
});
