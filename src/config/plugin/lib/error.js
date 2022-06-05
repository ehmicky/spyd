import { modernErrors } from '../../../error/modern.js'

const { CoreError, UserError, PluginError, ConsumerError, onError } =
  modernErrors(['CoreError', 'UserError', 'PluginError', 'ConsumerError'])

export {
  // Error from the library
  CoreError,
  // Error from the library's user, who defines available plugin types
  UserError,
  // Error from a plugin author, who defines a specific plugin
  PluginError,
  // Error from a plugin user
  ConsumerError,
  // Top-level error handler
  onError,
}
