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
