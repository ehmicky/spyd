import { createRequire } from 'module'
import { isAbsolute } from 'path'

import { wrapError } from '../../../error/wrap.js'

// `pluginConfig.id` can be:
//  - A builtin identifier among `pluginType.builtins`
//  - A file path starting with . or /
//  - A Node module prefixed with `modulePrefix` (which is optional)
export const isModuleId = function (id, modulePrefix, builtins) {
  return (
    modulePrefix !== undefined &&
    !isBuiltinId(id, builtins) &&
    !isPathId(id, builtins)
  )
}

export const isPathId = function (id, builtins) {
  return !isBuiltinId(builtins, id) && (id.startsWith('.') || isAbsolute(id))
}

export const isBuiltinId = function (id, builtins) {
  return builtins[id] !== undefined
}

// Resolve Node module ids to absolute file paths.
// We enforce a npm package naming convention for all plugins.
// TODO: use import.meta.resolve() when available
export const resolveModuleId = function (id, modulePrefix, cwd) {
  try {
    return createRequire(cwd).resolve(`${modulePrefix}${id}`)
  } catch (error) {
    throw wrapError(
      error,
      `must be a valid package name.
This Node module was not found, please ensure it is installed.\n`,
    )
  }
}
