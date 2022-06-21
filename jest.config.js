/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleNameMapper: {
    '^@root/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@helper/(.*)$': '<rootDir>/src/helper/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@layout/(.*)$': '<rootDir>/src/layout/$1',
    '^@public/(.*)$': '<rootDir>/public/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
  },
};
