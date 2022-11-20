import ModernError from 'modern-errors'
import modernErrorsBugs from 'modern-errors-bugs'
import modernErrorsClean from 'modern-errors-clean'
import modernErrorsCli from 'modern-errors-cli'
import modernErrorsSwitch from 'modern-errors-switch'

import { bugs } from '../utils/package.js'

export const BaseError = ModernError.subclass('BaseError', {
  plugins: [
    modernErrorsBugs,
    modernErrorsCli,
    modernErrorsClean,
    modernErrorsSwitch,
  ],
})

export const UnknownError = BaseError.subclass('UnknownError', {
  bugs,
  cli: { exitCode: 1, header: 'red bold', icon: 'cross' },
})

// Bug in a plugin (reporter|runner)
export const PluginError = BaseError.subclass('PluginError', {
  cli: { exitCode: 2, header: 'magenta bold', icon: 'star' },
})

// Tasks failed to load or run
export const TaskError = BaseError.subclass('TaskError', {
  cli: { exitCode: 3, header: 'yellow bold', icon: 'pointer' },
})

// Invalid syntax with options or tasks file
export const UserError = BaseError.subclass('UserError', {
  cli: { exitCode: 4, header: 'yellow bold', icon: 'warning', stack: false },
})

// `limit` option threshold was reached
export const LimitError = BaseError.subclass('LimitError', {
  cli: { exitCode: 5, header: 'cyan bold', icon: 'triangleDown', stack: false },
})

// User aborting the benchmark
export const StopError = BaseError.subclass('StopError', {
  cli: { exitCode: 6, header: 'gray bold', icon: 'hamburger', stack: false },
})
