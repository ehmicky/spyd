import { CoreError, PluginError, UserError } from '../../error/main.js'
import { normalizeError } from '../../error/normalize/main.js'

// Translate error classes from the plugins library to error classes from this
// library
export const handlePluginsError = function (error) {
  const { name } = normalizeError(error)
  const ErrorType = name in ERROR_MAP ? ERROR_MAP[name] : CoreError
  return new ErrorType('', { cause: error })
}

const ERROR_MAP = {
  CoreError,
  UserError: CoreError,
  PluginError,
  ConsumerError: UserError,
}
