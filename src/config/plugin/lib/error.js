import { createErrorType } from '../../../error/utils.js'

// Error from the library
export const CoreError = createErrorType('CoreError')
// Error from the library's user, who defines available plugin types
export const UserError = createErrorType('UserError')
// Error from a plugin author, who defines a specific plugin
export const PluginError = createErrorType('PluginError')
// Error from a plugin user
export const ConsumerError = createErrorType('ConsumerError')
