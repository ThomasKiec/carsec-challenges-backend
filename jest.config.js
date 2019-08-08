module.exports = {
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.js'],
  coverageReporters: ['json', 'lcov', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleDirectories: ['node_modules'],
  testEnvironment: 'node',
}
