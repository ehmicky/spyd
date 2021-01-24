import { UserError } from '../../../error/main.js'

// Validate shell option.
// Shells have a performance impact and are less portable, so they are opt-in.
export const validateShell = function (shell) {
  if (shell !== undefined && !SHELL_VALUES.includes(shell)) {
    const shellValues = SHELL_VALUES.join(', ')
    throw new UserError(
      `Configuration property "runnerCli.shell" "${shell}" should be one of: ${shellValues}`,
    )
  }
}

// We only allow shells that are cross-platform
const SHELL_VALUES = ['none', 'sh', 'bash']
