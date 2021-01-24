import { validate } from 'jest-validate'

import { UserError } from '../../../error/main.js'

// Validate runnerConfig
export const validateConfig = function (runnerConfig) {
  validate(runnerConfig, { exampleConfig: EXAMPLE_CONFIG })
  validateShell(runnerConfig)
}

const EXAMPLE_CONFIG = {
  tasks: 'tasks.yml',
  shell: 'bash',
}

// Validate shell option.
// Shells have a performance impact and are less portable, so they are opt-in.
const validateShell = function ({ shell }) {
  if (shell !== undefined && !SHELL_VALUES.includes(shell)) {
    const shellValues = SHELL_VALUES.join(', ')
    throw new UserError(
      `Configuration property "runnerCli.shell" "${shell}" should be one of: ${shellValues}`,
    )
  }
}

// We only allow shells that are cross-platform
const SHELL_VALUES = ['none', 'sh', 'bash']
