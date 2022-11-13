import isErrorInstance from 'is-error-instance'

import { PluginError, UserError, TaskError } from '../../error/main.js'
import { BaseError } from '../../runners/common/error.js'

// When a task throws during any stage, we propagate the error and fail the
// benchmark. Tasks that throw are unstable and might yield invalid benchmarks,
// so we fail hard.
// The task sends an `error` object in a format that is based on JavaScript but
// should work for any programming language: `name`, `message`, `stack`.
export const throwOnTaskError = function ({ error: errorObject }) {
  if (errorObject === undefined) {
    return
  }

  const error = BaseError.fromJSON(errorObject)
  const { ErrorClass, prefix } = ERROR_MAP[getName(error)]
  throw new ErrorClass(prefix, { cause: error })
}

const getName = function (error) {
  return isErrorInstance(error) && error.name in ERROR_MAP
    ? error.name
    : DEFAULT_ERROR_NAME
}

// The `name` is among a series of possible ones, which allows abstracting:
//  - Whether the error should be reported as caused by the user or the plugin
//  - Prefixing the error message
const ERROR_MAP = {
  UnknownError: {
    ErrorClass: PluginError,
    prefix: 'Runner internal bug.',
  },
  IpcSerializationError: {
    ErrorClass: PluginError,
    prefix: 'Serialization error.',
  },
  TasksLoadError: {
    ErrorClass: TaskError,
    prefix: 'Could not load the tasks file.',
  },
  TasksRunError: {
    ErrorClass: TaskError,
    prefix: 'Could not run the task.',
  },
  TasksSyntaxError: {
    ErrorClass: UserError,
    prefix: 'Syntax error in the tasks file.',
  },
  ConfigError: {
    ErrorClass: UserError,
    prefix: 'Runner configuration error.',
  },
}

const DEFAULT_ERROR_NAME = 'UnknownError'
