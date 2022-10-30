import modernErrors from 'modern-errors'
import modernErrorsBugs from 'modern-errors-bugs'

import { bugs } from '../../../utils/package.js'

export const AnyError = modernErrors([modernErrorsBugs])

export const UnknownError = AnyError.subclass('UnknownError', { bugs })

// Error from the library's user, who defines available plugin types
export const UserError = AnyError.subclass('UserError')

// Error from a plugin author, who defines a specific plugin
export const PluginError = AnyError.subclass('PluginError')

// Error from a plugin user
export const ConsumerError = AnyError.subclass('ConsumerError')
