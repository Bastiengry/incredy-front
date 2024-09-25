export {};
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!**/vendor/**'],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  transform: {
    '.(ts|tsx)': 'babel-jest',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage',
    'package.json',
    'package-lock.json',
    'reportWebVitals.ts',
    'setupTests.ts',
    'index.tsx',
  ],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.ts',
    // '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
