import process from 'process'

import { normalizeError } from '../error/normalize/main.js'
import { addPadding } from '../report/utils/indent.js'

// Print CLI errors and exit, depending on the error type
export const handleCliError = function (error) {
  const errorA = normalizeError(error)
  const { exitCode, printStack, indented } = ERROR_PROPS[getErrorName(errorA)]
  const errorMessage = printStack ? errorA.stack : errorA.message
  const errorMessageA = indented ? addPadding(errorMessage) : errorMessage
  console.error(errorMessageA)
  process.exitCode = exitCode
}

const getErrorName = function ({ name }) {
  return name in ERROR_PROPS ? name : DEFAULT_ERROR_NAME
}

// Error type-specific behavior
const ERROR_PROPS = {
  CoreError: { exitCode: 5, printStack: true, indented: false },
  PluginError: { exitCode: 4, printStack: true, indented: false },
  UserCodeError: { exitCode: 3, printStack: true, indented: false },
  UserError: { exitCode: 2, printStack: false, indented: false },
  LimitError: { exitCode: 1, printStack: false, indented: false },
  StopError: { exitCode: 0, printStack: false, indented: true },
}

const DEFAULT_ERROR_NAME = 'CoreError'
