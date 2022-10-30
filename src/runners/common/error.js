import modernErrors from 'modern-errors'
import modernErrorsBugs from 'modern-errors-bugs'

import { packageJson } from '../../utils/package.js'

export const AnyError = modernErrors([modernErrorsBugs], {
  bugs: packageJson.bugs.url,
})

export const UnknownError = AnyError.subclass('UnknownError')

// Could not JSON-stringify IPC payload
export const IpcSerializationError = AnyError.subclass('IpcSerializationError')

// Tasks file throws when loading
export const TasksLoadError = AnyError.subclass('TasksLoadError')

// Tasks file has invalid syntax, e.g. exports invalid fields
export const TasksSyntaxError = AnyError.subclass('TasksSyntaxError')

// Tasks throws when running
export const TasksRunError = AnyError.subclass('TasksRunError')

// Invalid runner config
export const ConfigError = AnyError.subclass('ConfigError')
