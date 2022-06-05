import { modernErrors } from './modern.js'

const {
  CoreError,
  PluginError,
  UserCodeError,
  UserError,
  LimitError,
  StopError,
  onError,
} = modernErrors([
  'CoreError',
  'PluginError',
  'UserCodeError',
  'UserError',
  'LimitError',
  'StopError',
])

export {
  // Bug in the library itself
  CoreError,
  // Bug in a plugin (reporter|runner)
  PluginError,
  // Invalid tasks or tasks file
  UserCodeError,
  // Invalid options
  UserError,
  // `limit` option threshold was reached
  LimitError,
  // User aborting the benchmark
  StopError,
  // Top-level error handler
  onError,
}

// Error type-specific behavior
export const ERROR_PROPS = {
  CoreError: { exitCode: 5, printStack: true, indented: false },
  PluginError: { exitCode: 4, printStack: true, indented: false },
  UserCodeError: { exitCode: 3, printStack: true, indented: false },
  UserError: { exitCode: 2, printStack: false, indented: false },
  LimitError: { exitCode: 1, printStack: false, indented: false },
  StopError: { exitCode: 0, printStack: false, indented: true },
}
