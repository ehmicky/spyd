import { modernErrors } from '../../error/modern.js'

const {
  CoreError,
  IpcSerializationError,
  TasksLoadError,
  TasksSyntaxError,
  TasksRunError,
  ConfigError,
  onError,
} = modernErrors([
  'CoreError',
  'IpcSerializationError',
  'TasksLoadError',
  'TasksSyntaxError',
  'TasksRunError',
  'ConfigError',
])

export {
  // Error from the library itself
  CoreError,
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
  onError,
}
