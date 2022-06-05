import process from 'process'

import { normalizeError } from '../error/normalize/main.js'

// Print CLI errors and exit, depending on the error type
export const handleCliError = function (error) {
  const errorA = normalizeError(error)
  const {
    exitCode,
    short = false,
    silent = false,
  } = ERROR_PROPS[getErrorName(errorA)]

  if (!silent) {
    const errorMessage = short ? errorA.message : errorA.stack
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
  UserError: { exitCode: 2, short: true },
  LimitError: { exitCode: 1, short: true },
  StopError: { exitCode: 0, short: true },
}

const DEFAULT_ERROR_NAME = 'CoreError'
