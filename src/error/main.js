import modernErrors from 'modern-errors'
import modernErrorsBugs from 'modern-errors-bugs'
import modernErrorsStack from 'modern-errors-stack'

import { packageJson } from '../utils/package.js'

export const AnyError = modernErrors([modernErrorsBugs, modernErrorsStack], {
  bugs: packageJson.bugs.url,
})

export const UnknownError = AnyError.subclass('UnknownError', {
  cli: { exitCode: 1, header: 'red bold', icon: 'cross' },
})

// Bug in a plugin (reporter|runner)
export const PluginError = AnyError.subclass('PluginError', {
  cli: { exitCode: 2, header: 'magenta bold', icon: 'star' },
})

// User aborting the benchmark
export const StopError = AnyError.subclass('StopError', {
  cli: { exitCode: 3, header: 'gray bold', icon: 'hamburger' },
})

// Invalid tasks or tasks file
export const UserCodeError = AnyError.subclass('UserCodeError', {
  cli: { exitCode: 4, header: 'yellow bold', icon: 'pointer' },
})

// Invalid options
export const UserError = AnyError.subclass('UserError', {
  cli: { exitCode: 5, header: 'yellow bold', icon: 'warning' },
})

// `limit` option threshold was reached
export const LimitError = AnyError.subclass('LimitError', {
  cli: { exitCode: 6, header: 'cyan bold', icon: 'triangleDown' },
})
