// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // modulePaths: [
  //   '<rootDir>/src/app',
  //   '<rootDir>/src/store',
  //   '<rootDir>/src/api',
  // ],

  moduleNameMapper: {
    '^components(.*)$': '<rootDir>/src/app/components/$1',
    '^api(.*)$': '<rootDir>/src/api/$1',
    '^store(.*)$': '<rootDir>/src/store/$1',
  },

  displayName: 'conduits.app functional tests',

  // An array of file extensions your modules use
  moduleFileExtensions: [
    'js',
    'json',
    'jsx',
    'ts',
    'tsx',
    'node',
  ],

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // A list of paths to modules that run some code to configure or set up
  // the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/src/scripts/setup-rtl.js'],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).[tj]s?(x)',
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.jsx?$': '<rootDir>/src/cfg/jest.transform.babel.js',
    '^.+\\.s?css$': '<rootDir>/src/cfg/jest.transform.css.js',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/src/cfg/jest.transform.file.js'
  },

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};
