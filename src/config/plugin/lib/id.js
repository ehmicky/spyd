import { isAbsolute } from 'path'

import { wrapError } from '../../../error/wrap.js'
import { resolveModuleName } from '../../module.js'

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

export const resolveModuleId = function ({ id, modulePrefix, builtins, cwd }) {
  try {
    return resolveModuleName(id, modulePrefix, cwd)
  } catch (error) {
    throw wrapError(
      error,
      `must be ${getBuiltinsError(builtins)}
This Node module was not found, please ensure it is installed.\n`,
    )
  }
}

const getBuiltinsError = function (builtins) {
  const builtinIds = Object.keys(builtins)
  return builtinIds.length === 0
    ? 'a valid package name.'
    : `either:
 - a valid package name
 - a builtin plugin among: ${builtinIds.join(', ')}`
}
