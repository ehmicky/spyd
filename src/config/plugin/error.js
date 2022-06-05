import normalizeException from 'normalize-exception'

import { CoreError, PluginError, UserError } from '../../error/main.js'

// Translate error classes from the plugins library to error classes from this
// library
export const handlePluginsError = function (error) {
  const { name } = normalizeException(error)
  const ErrorType = name in ERROR_MAP ? ERROR_MAP[name] : CoreError
  return new ErrorType('', { cause: error })
}

const ERROR_MAP = {
  CoreError,
  UserError: CoreError,
  PluginError,
  ConsumerError: UserError,
}
