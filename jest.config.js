/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/modules/$1',
  },
  testRegex: '.*\\.(spec|test)\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.(service|usecase).ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '.module.ts'],
  verbose: true,
};
