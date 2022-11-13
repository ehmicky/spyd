import modernErrors from 'modern-errors'
import modernErrorsBugs from 'modern-errors-bugs'

import { bugs } from '../../../utils/package.js'

export const BaseError = modernErrors([modernErrorsBugs])

export const UnknownError = BaseError.subclass('UnknownError', { bugs })

// Error from the library's user, who defines available plugin types
export const UserError = BaseError.subclass('UserError')

// Error from a plugin author, who defines a specific plugin
export const PluginError = BaseError.subclass('PluginError')

// Error from a plugin user
export const ConsumerError = BaseError.subclass('ConsumerError')
