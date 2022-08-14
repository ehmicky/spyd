import { parse } from 'error-serializer'
import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { PluginError, UserError, UserCodeError } from '../../error/main.js'

// When a task throws during any stage, we propagate the error and fail the
// benchmark. Tasks that throw are unstable and might yield invalid benchmarks,
// so we fail hard.
// The task sends an `error` object in a format that is based on JavaScript but
// should work for any programming language: `name`, `message`, `stack`.
export const throwOnTaskError = function ({ error: errorObject }) {
  if (errorObject === undefined) {
    return
  }

  const error = parse(errorObject, { types: ERROR_TYPES })
  throw addPrefix(error, errorObject)
}

const addPrefix = function (error, errorObject) {
  const name = getName(errorObject)
  const { prefix } = ERROR_PROPS[name]
  return new Error(prefix, { cause: error })
}

const getName = function (errorObject) {
  return isPlainObj(errorObject) &&
    typeof errorObject.name === 'string' &&
    errorObject.name in ERROR_PROPS
    ? errorObject.name
    : DEFAULT_ERROR_NAME
}

// The `name` is among a series of possible ones, which allows abstracting:
//  - Whether the error should be reported as caused by the user or the plugin
//  - Prefixing the error message
const ERROR_PROPS = {
  InternalError: {
    ErrorType: PluginError,
    prefix: 'Runner internal bug.',
  },
  IpcSerializationError: {
    ErrorType: PluginError,
    prefix: 'Serialization error.',
  },
  TasksLoadError: {
    ErrorType: UserCodeError,
    prefix: 'Could not load the tasks file.',
  },
  TasksSyntaxError: {
    ErrorType: UserCodeError,
    prefix: 'Syntax error in the tasks file.',
  },
  TasksRunError: {
    ErrorType: UserCodeError,
    prefix: 'Could not run the task.',
  },
  ConfigError: {
    ErrorType: UserError,
    prefix: 'Runner configuration error.',
  },
}

const DEFAULT_ERROR_NAME = 'InternalError'

const getErrorType = function (name, { ErrorType }) {
  return [name, ErrorType]
}

const ERROR_TYPES = mapObj(ERROR_PROPS, getErrorType)
