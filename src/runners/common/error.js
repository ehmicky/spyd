import modernErrors from 'modern-errors'

import { packageJson } from '../../utils/package.js'

export const {
  // Could not JSON-stringify IPC payload
  IpcSerializationError,
  // Tasks file throws when loading
  TasksLoadError,
  // Tasks file has invalid syntax, e.g. exports invalid fields
  TasksSyntaxError,
  // Tasks throws when running
  TasksRunError,
  // Invalid runner config
  ConfigError,
  // Top-level error handler
  errorHandler,
} = modernErrors({ bugsUrl: packageJson.bugs.url })
