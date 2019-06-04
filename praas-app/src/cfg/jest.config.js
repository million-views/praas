// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  modulePaths: [
    '<rootDir>/src/app',
  ],

  // An array of file extensions your modules use
  moduleFileExtensions: [
    'js',
    'json',
    'jsx',
    'ts',
    'tsx',
    'node',
  ],

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
