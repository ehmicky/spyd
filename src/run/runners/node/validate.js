import { multipleValidOptions } from 'jest-validate'

import { validateConfigProps } from '../../../utils/validate.js'

// Validate runnerConfig
export const validateConfig = function (runnerConfig) {
  validateConfigProps(runnerConfig, { exampleConfig: EXAMPLE_CONFIG })
}

const EXAMPLE_CONFIG = {
  tasks: 'tasks.js',
  // eslint-disable-next-line no-magic-numbers
  version: multipleValidOptions('12', 12),
}
