import { isAbsolute } from 'path'

import { wrapError } from '../../../error/wrap.js'

import { resolveModuleName } from './module.js'

// `pluginConfig[pluginProp]` can be:
//  - The direct value
//     - This is useful for programmatic usage,
//     - For example, by exposing to plugin consumers a function like:
//         (pluginConfig) => ({ plugin, pluginConfig })
//       which is passed as argument to this library
//  - A builtin identifier among `opts.builtins`
//  - A file path starting with . or /
//  - A Node module prefixed with `modulePrefix` (which is optional)
export const isModuleLocation = function (location, modulePrefix, builtins) {
  return (
    modulePrefix !== undefined &&
    !isInlineLocation(location) &&
    !isBuiltinLocation(location, builtins) &&
    !isPathLocation(location, builtins)
  )
}

export const isPathLocation = function (location, builtins) {
  return (
    !isInlineLocation(location) &&
    !isBuiltinLocation(location, builtins) &&
    (location.startsWith('.') || isAbsolute(location))
  )
}

export const isBuiltinLocation = function (location, builtins) {
  return builtins[location] !== undefined
}

export const isInlineLocation = function (location) {
  return typeof location !== 'string'
}

export const resolveModuleLocation = function ({
  location,
  modulePrefix,
  builtins,
  cwd,
}) {
  try {
    return resolveModuleName(location, modulePrefix, cwd)
  } catch (error) {
    throw wrapError(
      error,
      `must be ${getBuiltinsError(builtins)}
This Node module was not found, please ensure it is installed.\n`,
    )
  }
}

const getBuiltinsError = function (builtins) {
  const builtinNames = Object.keys(builtins)
  return builtinNames.length === 0
    ? 'a valid package name.'
    : `either:
 - a valid package name
 - a builtin plugin among: ${builtinNames.join(', ')}`
}
