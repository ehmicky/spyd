import isPlainObj from 'is-plain-obj'

import { PluginError, UserError, UserCodeError } from '../../error/main.js'

// When a task throws during any stage, we propagate the error and fail the
// benchmark. Tasks that throw are unstable and might yield invalid benchmarks,
// so we fail hard.
// The task sends an `error` object in a format that is based on JavaScript but
// should work for any programming language: `name`, `message`, `stack`.
export const throwOnTaskError = function ({ error }) {
  if (error === undefined) {
    return
  }

  const { name, message, stack } = isPlainObj(error)
    ? error
    : { message: error }
  const errorA = applyErrorProps(name, message)
  setErrorStack(errorA, { name, message, stack })
  throw errorA
}

const applyErrorProps = function (name, message) {
  const nameA =
    typeof name === 'string' && name in ERROR_PROPS ? name : DEFAULT_ERROR_NAME
  const { ErrorType, prefix } = ERROR_PROPS[nameA]
  return new ErrorType(`${prefix}: ${message}`)
}

// The `name` is among a series of possible ones, which allows abstracting:
//  - Whether the error should be reported as caused by the user or the plugin
//  - Prefixing the error message
const ERROR_PROPS = {
  CoreError: {
    ErrorType: PluginError,
    prefix: 'Runner internal bug',
  },
  IpcSerializationError: {
    ErrorType: PluginError,
    prefix: 'Serialization error',
  },
  TasksLoadError: {
    ErrorType: UserCodeError,
    prefix: 'Could not load the tasks file',
  },
  TasksSyntaxError: {
    ErrorType: UserCodeError,
    prefix: 'Syntax error in the tasks file',
  },
  TasksRunError: {
    ErrorType: UserCodeError,
    prefix: 'When running the task',
  },
  ConfigError: {
    ErrorType: UserError,
    prefix: 'Runner configuration error',
  },
}

const DEFAULT_ERROR_NAME = 'CoreError'

// Keep the stack trace from the runner's process, but update it with the new
// `name` and `message`
const setErrorStack = function (error, { name, message, stack }) {
  if (typeof stack !== 'string' || stack.trim() === '') {
    return
  }

  const oldStackStart = getStackHeader({ name, message })
  const stackA = stack.startsWith(oldStackStart)
    ? stack.slice(oldStackStart.length)
    : stack
  const newStackStart = getStackHeader(error)
  const stackB = `${newStackStart}${stackA}`
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'stack', { value: stackB, enumerable: false })
}

const getStackHeader = function ({ name, message }) {
  return `${name}: ${message}\n`
}
