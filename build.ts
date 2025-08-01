import { build } from "bun"

await build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./public/dist",
  target: "browser",
  format: "esm",
  splitting: true,
  sourcemap: "external",
  minify: true,
})