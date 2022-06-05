import normalizeException from 'normalize-exception'

import { PluginError, UserError } from '../../error/main.js'

// Translate error classes from the plugins library to error classes from this
// library
export const handlePluginsError = function (error) {
  const { name } = normalizeException(error)
  const ErrorType = name in ERROR_MAP ? ERROR_MAP[name] : Error
  return new ErrorType('', { cause: error })
}

const ERROR_MAP = {
  SystemError: Error,
  UserError: Error,
  PluginError,
  ConsumerError: UserError,
}
