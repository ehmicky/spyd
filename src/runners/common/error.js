import { createRequire } from 'module'

import { modernErrors } from '../../error/modern/main.js'

// TODO: replace with JSON imports after dropping support for Node <16.14.0
const {
  bugs: { url: bugsUrl },
} = createRequire(import.meta.url)('../../../../package.json')

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
  { bugsUrl },
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
