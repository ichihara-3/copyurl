module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./tests/setup.js'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.integration.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/manifest.json',
    '!src/_locales/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
