import ModernError from 'modern-errors'
import modernErrorsSerialize from 'modern-errors-serialize'

export const BaseError = ModernError.subclass('BaseError', {
  plugins: [modernErrorsSerialize],
})

export const UnknownError = BaseError.subclass('UnknownError')

// Could not JSON-stringify IPC payload
export const IpcSerializationError = BaseError.subclass('IpcSerializationError')

// Tasks file throws when loading
export const TasksLoadError = BaseError.subclass('TasksLoadError')

// Tasks throws when running
export const TasksRunError = BaseError.subclass('TasksRunError')

// Tasks file has invalid syntax, e.g. exports invalid fields
export const TasksSyntaxError = BaseError.subclass('TasksSyntaxError')

// Invalid runner config
export const ConfigError = BaseError.subclass('ConfigError')
