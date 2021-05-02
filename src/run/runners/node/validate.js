import { validate, multipleValidOptions } from 'jest-validate'

// Validate runnerConfig
export const validateConfig = function (runnerConfig) {
  validate(runnerConfig, { exampleConfig: EXAMPLE_CONFIG })
}

const EXAMPLE_CONFIG = {
  tasks: 'tasks.js',
  // eslint-disable-next-line no-magic-numbers
  version: multipleValidOptions('12', 12),
}
