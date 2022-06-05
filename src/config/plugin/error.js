import { CoreError, PluginError, UserError } from '../../error/main.js'
import { normalizeError } from '../../error/normalize.js'
import { wrapError } from '../../error/wrap.js'

// Translate error classes from the plugins library to error classes from this
// library
export const handlePluginsError = function (error) {
  const { name } = normalizeError(error)
  const ErrorType = name in ERROR_MAP ? ERROR_MAP[name] : CoreError
  return wrapError(error, '', ErrorType)
}

const ERROR_MAP = {
  CoreError,
  UserError: CoreError,
  PluginError,
  ConsumerError: UserError,
}
