import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  platform: 'node',
  // Bundle the shared src/lib/ code into the output.
  // npm packages stay external (resolved from node_modules at runtime).
  noExternal: [/^\.\.\/.*src\/lib\//],
});
