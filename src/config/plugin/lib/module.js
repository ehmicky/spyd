import { createRequire } from 'module'

// Resolve Node module names to absolute file paths.
// We enforce a npm package naming convention for all plugins.
// TODO: use import.meta.resolve() when available
export const resolveModuleName = function (name, modulePrefix, cwd) {
  const moduleName = getModuleName(name, modulePrefix)
  return createRequire(`${cwd}/`).resolve(moduleName)
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
