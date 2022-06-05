import { createErrorType } from './create.js'

// Bug in the library itself
export const CoreError = createErrorType('CoreError')
// Bug in a plugin (reporter|runner)
export const PluginError = createErrorType('PluginError')
// Invalid tasks or tasks file
export const UserCodeError = createErrorType('UserCodeError')
// Invalid options
export const UserError = createErrorType('UserError')
// `limit` option threshold was reached
export const LimitError = createErrorType('LimitError')
// User aborting the benchmark
export const StopError = createErrorType('StopError')

// All error types, with first being default type
export const ErrorTypes = [
  CoreError,
  PluginError,
  UserCodeError,
  UserError,
  LimitError,
  StopError,
]

// Error type-specific behavior
export const ERROR_PROPS = {
  CoreError: { exitCode: 5, printStack: true, indented: false },
  PluginError: { exitCode: 4, printStack: true, indented: false },
  UserCodeError: { exitCode: 3, printStack: true, indented: false },
  UserError: { exitCode: 2, printStack: false, indented: false },
  LimitError: { exitCode: 1, printStack: false, indented: false },
  StopError: { exitCode: 0, printStack: false, indented: true },
}
