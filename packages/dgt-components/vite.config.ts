import { resolve } from 'path';
import { defineConfig } from 'vite'

export default ({ command, mode }) => {
  if (command === 'serve') {
    return defineConfig({
      root: 'demo',
      build: {
        target: 'es2015',
        outDir: '../dist'
      },
      define: {
        'process.env.NODE_DEBUG': undefined
      },
      server: {
        port: 8080,
      }
    })
  } else if(command === 'build' && mode === 'semcom') {
    return defineConfig({
      root: 'lib',
      build: {
        target: 'es2015',
        lib: {
          entry: resolve(__dirname, 'lib/index.ts'),
          name: '@digita-ai/dgt-components'
        },
        outDir: '../dist'
      },
      define: {
        'process.env.NODE_DEBUG': undefined
      },
    })
  } else if(command === 'build' && mode === 'bundle') {
    return defineConfig({
      root: 'lib',
      build: {
        target: 'es2015',
        lib: {
          entry: resolve(__dirname, 'lib/index.ts'),
          name: '@digita-ai/dgt-components'
        },
        outDir: '../dist'
      },
      define: {
        'process.env.NODE_DEBUG': undefined
      },
    })
  }
}