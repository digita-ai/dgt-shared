import type { Config } from 'jest';

const modules = [ "@appnest/lit-translate", "lit-html", "lit-element", "rx-lit", "jose", "uuid" ];

const config: Config = {
  displayName: "dgt-components",
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: [
    "<rootDir>/tests/setup.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 76.33,
      functions: 74.01,
      lines: 88.97,
      statements: 89.22
    }
  },
  transformIgnorePatterns: [
    // Use a negative lookahead for the last occurence by adding .*
    // This gets around the .pnpm folder
    `/node_modules/(?!(.*${modules.join('|.*')})/)`
  ],
  transform: {
    '^.+\\.ts?$': [
      'ts-jest', {
        diagnostics: {
          warnOnly: true
        },
        tsconfig: "<rootDir>/tsconfig.spec.json",
      }
    ],
    ... modules.reduce((acc, module) => ({...acc, [module]:[
      'ts-jest', {
        diagnostics: {
          warnOnly: true
        },
        tsconfig: "<rootDir>/tsconfig.spec.json",
      }
    ]}), {}),
  },
  automock: false,
  coveragePathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/node_modules/",
    "<rootDir>/.*\\.conf(ig)?.ts",
    "<rootDir>/lib/index.ts",
    "<rootDir>/lib/app.ts",
    "<rootDir>/.*\\.d.ts",
    "<rootDir>/demo/"
  ],
  maxWorkers: 4,
  moduleNameMapper: {
    "^jose/(.*)$": "<rootDir>/node_modules/jose/dist/node/cjs/$1"
  },
};

export default config;
