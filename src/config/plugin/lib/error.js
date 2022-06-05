import { createRequire } from 'module'

import { modernErrors } from '../../../error/modern/main.js'

// TODO: replace with JSON imports after dropping support for Node <16.14.0
const {
  bugs: { url: bugsUrl },
} = createRequire(import.meta.url)('../../../../../package.json')

const { UserError, PluginError, ConsumerError, onError } = modernErrors(
  ['UserError', 'PluginError', 'ConsumerError'],
  { bugsUrl },
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
