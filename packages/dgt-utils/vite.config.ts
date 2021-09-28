import path from 'path';
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'lib',
  build: {
      target: 'es2015',
      lib: {
          entry: path.resolve(__dirname, 'lib/public-api.ts'),
          name: '@digita-ai/dgt-utils'
      },
      outDir: '../dist'
  }
});