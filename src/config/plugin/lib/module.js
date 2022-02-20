import { createRequire } from 'module'

import { wrapError } from '../../../error/wrap.js'

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
  } catch (error) {
    throw wrapError(
      error,
      `must be ${getBuiltinsError(builtins)}
This Node module was not found, please ensure it is installed.\n`,
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
