/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const nextJest = require('next/jest');
const createJestConfig = nextJest({
  dir: './',
});
const customJestConfig = {
  clearMocks: true,
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  preset: 'ts-jest',
  verbose: true,
  moduleNameMapper: {
    '^@root/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@helper/(.*)$': '<rootDir>/src/helper/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@layout/(.*)$': '<rootDir>/src/layout/$1',
    '^@public/(.*)$': '<rootDir>/public/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^@tests/(.*)$': '<rootDir>/_tests_/$1',
  },
};
module.exports = createJestConfig(customJestConfig);
