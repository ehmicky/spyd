import { createErrorType, getErrorTypeProps } from './utils.js'

// User aborting the benchmark
export const StopError = createErrorType('StopError')
// Bug in the library itself
export const CoreError = createErrorType('CoreError')
// Bug in a plugin (reporter|runner)
export const PluginError = createErrorType('PluginError')
// Invalid options
export const UserError = createErrorType('UserError')
// Invalid tasks or tasks file
export const UserCodeError = createErrorType('UserCodeError')
// `limit` option threshold was reached
export const LimitError = createErrorType('LimitError')

// Retrieve error type-specific behavior
export const getErrorProps = function (error) {
  return getErrorTypeProps(error.name, ERROR_PROPS, DEFAULT_ERROR_NAME)
}

const ERROR_PROPS = {
  StopError: { exitCode: 0, printStack: false, indented: true },
  CoreError: { exitCode: 1, printStack: true, indented: false },
  PluginError: { exitCode: 2, printStack: true, indented: false },
  UserError: { exitCode: 3, printStack: false, indented: false },
  UserCodeError: { exitCode: 3, printStack: true, indented: false },
  LimitError: { exitCode: 4, printStack: false, indented: false },
}

const DEFAULT_ERROR_NAME = 'CoreError'
