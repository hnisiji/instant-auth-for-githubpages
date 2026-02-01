module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@instant-lock/cryptor$': '<rootDir>/../cryptor/src/index.ts'
  }
};