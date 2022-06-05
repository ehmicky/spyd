import { modernErrors } from '../../error/modern/main.js'
import { packageJson } from '../../utils/package.js'

const {
  IpcSerializationError,
  TasksLoadError,
  TasksSyntaxError,
  TasksRunError,
  ConfigError,
  onError,
} = modernErrors(
  [
    'IpcSerializationError',
    'TasksLoadError',
    'TasksSyntaxError',
    'TasksRunError',
    'ConfigError',
  ],
  { bugsUrl: packageJson.bugs.url },
)

export {
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
