import { createErrorType, normalizeError } from '../../error/utils.js'

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

// Serialize an error to send to parent
export const serializeError = function (error) {
  const { name, message, stack } = normalizeError(error)
  return { name, message, stack }
}
