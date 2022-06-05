import process from 'process'

import { normalizeError } from '../error/normalize/main.js'
import { addPadding } from '../report/utils/indent.js'

// Print CLI errors and exit, depending on the error type
// TODO: allow error types to not print anything
export const handleCliError = function (error) {
  const errorA = normalizeError(error)
  const {
    exitCode,
    stack = true,
    indented = false,
  } = ERROR_PROPS[getErrorName(errorA)]
  const errorMessage = stack ? errorA.stack : errorA.message
  const errorMessageA = indented ? addPadding(errorMessage) : errorMessage
  console.error(errorMessageA)
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
  StopError: { exitCode: 0, stack: false, indented: true },
}

const DEFAULT_ERROR_NAME = 'CoreError'
