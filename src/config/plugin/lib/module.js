import { createRequire } from 'module'

// Resolve Node module ids to absolute file paths.
// We enforce a npm package naming convention for all plugins.
// TODO: use import.meta.resolve() when available
export const resolveModuleName = function (id, modulePrefix, cwd) {
  const moduleName = getModuleName(id, modulePrefix)
  return createRequire(`${cwd}/`).resolve(moduleName)
}

// We allow module names to be either:
//  -        id ->        {modulePrefix}-{id}
//  - @scope/id -> @scope/{modulePrefix}-{id}
const getModuleName = function (id, modulePrefix) {
  const [scope, scopedName] = getModuleScope(id)
  return `${scope}${modulePrefix}-${scopedName}`
}

const getModuleScope = function (id) {
  if (!id.startsWith('@')) {
    return ['', id]
  }

  const slashIndex = id.indexOf('/')

  if (slashIndex === -1) {
    return ['', id]
  }

  return [id.slice(0, slashIndex + 1), id.slice(slashIndex + 1)]
}
