import { createErrorType, normalizeError } from '../../error/utils.js'

export const IpcSerializationError = createErrorType('IpcSerializationError')
export const TasksLoadError = createErrorType('TasksLoadError')
export const TasksSyntaxError = createErrorType('TasksSyntaxError')
export const TasksRunError = createErrorType('TasksRunError')
export const ConfigError = createErrorType('ConfigError')

// Serialize an error to send to parent
export const serializeError = function (error) {
  const { name, message, stack } = normalizeError(error)
  return { name, message, stack }
}
