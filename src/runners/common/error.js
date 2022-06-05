import { createErrorType } from '../../error/create.js'
import { onError } from '../../error/handler.js'

// Error from the library itself
export const CoreError = createErrorType('CoreError')
// Could not JSON-stringify IPC payload
export const IpcSerializationError = createErrorType('IpcSerializationError')
// Tasks file throws when loading
export const TasksLoadError = createErrorType('TasksLoadError')
// Tasks file has invalid syntax, e.g. exports invalid fields
export const TasksSyntaxError = createErrorType('TasksSyntaxError')
// Tasks throws when running
export const TasksRunError = createErrorType('TasksRunError')
// Invalid runner config
export const ConfigError = createErrorType('ConfigError')

// All error types, with first being default type
const ErrorTypes = [
  CoreError,
  IpcSerializationError,
  TasksLoadError,
  TasksSyntaxError,
  TasksRunError,
  ConfigError,
]

// Serialize an error to send to parent
export const serializeError = function (error) {
  const { name, message, stack } = onError(error, ErrorTypes)
  return { name, message, stack }
}
