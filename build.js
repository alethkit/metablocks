import esbuild from "esbuild";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  outdir: "build",
  format: "esm",
  splitting: true,
  write: true,
  globalName: "metablocks",
  minify: false,
  sourcemap: true,
  platform: "browser",
  target: ["es2015"],
  plugins: [
    polyfillNode({
      // Options (optional)
    }),
  ],
});
