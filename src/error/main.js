import modernErrors from 'modern-errors'

import { packageJson } from '../utils/package.js'

export const {
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
  errorHandler,
} = modernErrors({ bugsUrl: packageJson.bugs.url })
