import modernErrors from 'modern-errors'

import { packageJson } from '../../../utils/package.js'

export const {
  // Error from the library's user, who defines available plugin types
  UserError,
  // Error from a plugin author, who defines a specific plugin
  PluginError,
  // Error from a plugin user
  ConsumerError,
  // Top-level error handler
  errorHandler,
} = modernErrors({ bugsUrl: packageJson.bugs.url })
