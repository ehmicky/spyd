import { modernErrors } from '../../../error/modern/main.js'
import { packageJson } from '../../../utils/package.js'

const { UserError, PluginError, ConsumerError, onError } = modernErrors(
  ['UserError', 'PluginError', 'ConsumerError'],
  { bugsUrl: packageJson.bugs.url },
)

export {
  // Error from the library's user, who defines available plugin types
  UserError,
  // Error from a plugin author, who defines a specific plugin
  PluginError,
  // Error from a plugin user
  ConsumerError,
  // Top-level error handler
  onError,
}
