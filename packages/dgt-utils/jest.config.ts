import type { Config } from 'jest';

const config: Config = {
  displayName: 'components',
  preset: '@useid/jest-config',
  testEnvironment: 'jsdom',
  setupFiles: [
    '<rootDir>/tests/setup.ts'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(lit-html|@appnest/lit-translate)/)'
  ],
  coverageThreshold: {
    global: {
      branches: 58.57,
      functions: 51.94,
      lines: 63.3,
      statements: 63.88
    }
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/.*\\.conf(ig)?.ts',
    '<rootDir>/lib/index.ts'
  ]
};

export default config;
