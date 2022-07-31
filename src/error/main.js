import modernErrors from 'modern-errors'

import { packageJson } from '../utils/package.js'

export const {
  // User aborting the benchmark
  StopError,
  // `limit` option threshold was reached
  LimitError,
  // Invalid options
  UserError,
  // Invalid tasks or tasks file
  UserCodeError,
  // Bug in a plugin (reporter|runner)
  PluginError,
  // Top-level error handler
  errorHandler,
} = modernErrors({ bugsUrl: packageJson.bugs.url })
