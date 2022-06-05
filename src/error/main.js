import { modernErrors } from './modern/main.js'

const {
  PluginError,
  UserCodeError,
  UserError,
  LimitError,
  StopError,
  onError,
} = modernErrors([
  'PluginError',
  'UserCodeError',
  'UserError',
  'LimitError',
  'StopError',
])

export {
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
