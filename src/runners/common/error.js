import modernErrors from 'modern-errors'
import modernErrorsSerialize from 'modern-errors-serialize'

export const AnyError = modernErrors([modernErrorsSerialize])

export const UnknownError = AnyError.subclass('UnknownError')

// Could not JSON-stringify IPC payload
export const IpcSerializationError = AnyError.subclass('IpcSerializationError')

// Tasks file throws when loading
export const TasksLoadError = AnyError.subclass('TasksLoadError')

// Tasks throws when running
export const TasksRunError = AnyError.subclass('TasksRunError')

// Tasks file has invalid syntax, e.g. exports invalid fields
export const TasksSyntaxError = AnyError.subclass('TasksSyntaxError')

// Invalid runner config
export const ConfigError = AnyError.subclass('ConfigError')
