import { createErrorType, getErrorTypeProps } from '../../../error/utils.js'

// Error from the library
export const CoreError = createErrorType('CoreError')
// Error from the library's user, who defines available plugin types
export const UserError = createErrorType('UserError')
// Error from a plugin author, who defines a specific plugin
export const PluginError = createErrorType('PluginError')
// Error from a plugin user
export const ConsumerError = createErrorType('ConsumerError')

// Retrieve error type-specific behavior
export const getErrorProps = function (error) {
  return getErrorTypeProps(error.name, DEFAULT_ERROR_NAME)
}

const DEFAULT_ERROR_NAME = 'CoreError'
