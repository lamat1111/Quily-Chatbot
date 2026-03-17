import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  noExternal: [/(.*)/],
  external: ['discord.js', '@discordjs/rest', '@discordjs/ws'],
  platform: 'node',
  alias: {
    '@/lib': '../src/lib',
  },
});
