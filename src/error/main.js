import { createErrorType, getErrorTypeProps } from './utils.js'

// We distinguish between user, plugin and core errors.
// We also define abort errors, which are user-driven but are not failures.
// Limit errors are also special as they are user-driven but are a different
// kind of failure.
export const StopError = createErrorType('StopError')
export const CoreError = createErrorType('CoreError')
export const PluginError = createErrorType('PluginError')
export const UserError = createErrorType('UserError')
export const UserCodeError = createErrorType('UserCodeError')
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
