import process from 'process'

import { normalizeError } from '../error/normalize/main.js'

// Print CLI errors and exit, depending on the error type
export const handleCliError = function (error) {
  const errorA = normalizeError(error)
  const {
    exitCode,
    stack = true,
    silent = false,
  } = ERROR_PROPS[getErrorName(errorA)]

  if (!silent) {
    const errorMessage = stack ? errorA.stack : errorA.message
    console.error(errorMessage)
  }

  process.exitCode = exitCode
}

const getErrorName = function ({ name }) {
  return name in ERROR_PROPS ? name : DEFAULT_ERROR_NAME
}

// Error type-specific behavior
const ERROR_PROPS = {
  CoreError: { exitCode: 5 },
  PluginError: { exitCode: 4 },
  UserCodeError: { exitCode: 3 },
  UserError: { exitCode: 2, stack: false },
  LimitError: { exitCode: 1, stack: false },
  StopError: { exitCode: 0, stack: false },
}

const DEFAULT_ERROR_NAME = 'CoreError'
