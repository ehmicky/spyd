import modernErrors from 'modern-errors'
import modernErrorsBugs from 'modern-errors-bugs'
import modernErrorsClean from 'modern-errors-clean'
import modernErrorsCli from 'modern-errors-cli'

import { bugs } from '../utils/package.js'

export const AnyError = modernErrors([
  modernErrorsBugs,
  modernErrorsCli,
  modernErrorsClean,
])

export const UnknownError = AnyError.subclass('UnknownError', {
  bugs,
  cli: { exitCode: 1, header: 'red bold', icon: 'cross' },
})

// Bug in a plugin (reporter|runner)
export const PluginError = AnyError.subclass('PluginError', {
  cli: { exitCode: 2, header: 'magenta bold', icon: 'star' },
})

// Tasks failed to load or run
export const TaskError = AnyError.subclass('TaskError', {
  cli: { exitCode: 3, header: 'yellow bold', icon: 'pointer' },
})

// Invalid syntax with options or tasks file
export const UserError = AnyError.subclass('UserError', {
  cli: { exitCode: 4, header: 'yellow bold', icon: 'warning', stack: false },
})

// `limit` option threshold was reached
export const LimitError = AnyError.subclass('LimitError', {
  cli: { exitCode: 5, header: 'cyan bold', icon: 'triangleDown', stack: false },
})

// User aborting the benchmark
export const StopError = AnyError.subclass('StopError', {
  cli: { exitCode: 6, header: 'gray bold', icon: 'hamburger', stack: false },
})
