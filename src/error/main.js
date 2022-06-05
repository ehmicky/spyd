import { createRequire } from 'module'

import { modernErrors } from './modern/main.js'

// TODO: replace with JSON imports after dropping support for Node <16.14.0
const {
  bugs: { url: bugsUrl },
} = createRequire(import.meta.url)('../../../package.json')

const {
  PluginError,
  UserCodeError,
  UserError,
  LimitError,
  StopError,
  onError,
} = modernErrors(
  ['PluginError', 'UserCodeError', 'UserError', 'LimitError', 'StopError'],
  { bugsUrl },
)

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
