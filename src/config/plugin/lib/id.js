import { createRequire } from 'module'
import { isAbsolute } from 'path'

import { wrapError } from '../../../error/wrap.js'

// `pluginConfig.id` can be:
//  - The direct value
//     - This is useful for programmatic usage,
//     - For example, by exposing to plugin consumers a function like:
//         (pluginConfig) => ({ plugin, pluginConfig })
//       which is passed as argument to this library
//  - A builtin identifier among `pluginType.builtins`
//  - A file path starting with . or /
//  - A Node module prefixed with `modulePrefix` (which is optional)
export const isModuleId = function (id, modulePrefix, builtins) {
  return (
    modulePrefix !== undefined &&
    !isInlineId(id) &&
    !isBuiltinId(id, builtins) &&
    !isPathId(id, builtins)
  )
}

export const isPathId = function (id, builtins) {
  return (
    !isInlineId(id) &&
    !isBuiltinId(id, builtins) &&
    (id.startsWith('.') || isAbsolute(id))
  )
}

export const isBuiltinId = function (id, builtins) {
  return builtins[id] !== undefined
}

export const isInlineId = function (id) {
  return typeof id !== 'string'
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
