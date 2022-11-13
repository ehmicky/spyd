import { createRequire } from 'node:module'

import { BaseError } from './error.js'

// Resolve Node module names to absolute file paths.
// We enforce a npm package naming convention for all plugins.
// TODO: use import.meta.resolve() when available
export const resolveModuleLocation = function (
  location,
  { context: { modulePrefix, builtins }, cwd },
) {
  const moduleName = getModuleName(location, modulePrefix)

  try {
    return createRequire(`${cwd}/`).resolve(moduleName)
  } catch (cause) {
    throw new BaseError(
      `must be ${getBuiltinsError(builtins)}
This Node module was not found, please ensure it is installed:\n`,
      { cause },
    )
  }
}

// We allow module names to be either:
//  -        name ->        {modulePrefix}-{name}
//  - @scope/name -> @scope/{modulePrefix}-{name}
const getModuleName = function (name, modulePrefix) {
  const [scope, scopedName] = getModuleScope(name)
  return `${scope}${modulePrefix}-${scopedName}`
}

const getModuleScope = function (name) {
  if (!name.startsWith('@')) {
    return ['', name]
  }

  const slashIndex = name.indexOf('/')

  if (slashIndex === -1) {
    return ['', name]
  }

  return [name.slice(0, slashIndex + 1), name.slice(slashIndex + 1)]
}

const getBuiltinsError = function (builtins) {
  const builtinNames = Object.keys(builtins)
  return builtinNames.length === 0
    ? 'a valid package name.'
    : `either:
 - a valid package name
 - a builtin plugin among: ${builtinNames.join(', ')}`
}
