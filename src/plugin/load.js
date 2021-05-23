import { PluginError, UserError } from '../error/main.js'

// Import plugin's code
export const loadPlugins = async function ({
  ids,
  type,
  modulePrefix,
  builtins,
}) {
  return await Promise.all(
    ids.map((id) => loadPlugin({ id, type, modulePrefix, builtins })),
  )
}

const loadPlugin = async function ({ id, type, modulePrefix, builtins }) {
  const plugin = await importPlugin({ id, type, modulePrefix, builtins })
  return { ...plugin, id }
}

const importPlugin = async function ({ id, type, modulePrefix, builtins }) {
  const builtin = builtins[id]

  if (builtin !== undefined) {
    return builtin
  }

  const moduleName = `${modulePrefix}${id}`

  try {
    return await import(moduleName)
  } catch (error) {
    throw new PluginError(
      `Could not load '${type}' module '${moduleName}'\n\n${error.stack}`,
    )
  }
}

// Find the local file path of a plugin
// TODO: use this in all plugins
export const getPluginPath = function ({ id, modulePrefix, type, base }) {
  const possiblePaths = getPossiblePaths(modulePrefix, id)
  const resolvedPath = possiblePaths.find((pluginPath) =>
    tryResolvePluginPath(pluginPath, base),
  )

  if (resolvedPath === undefined) {
    const possiblePathsStr = possiblePaths.join(' or ')
    throw new UserError(`Cannot find ${type}: ${id}
No Node module ${possiblePathsStr} was found, please ensure it is installed.`)
  }

  return resolvedPath
}

// We enforce a naming convention for all plugins.
// All plugins are Node modules.
// We do not allow npm @scope because:
//  - This is simpler for users
//  - This prevent the confusion (which could be malicious) created by the
//    ambiguity
const getPossiblePaths = function (modulePrefix, id) {
  return `spyd-${modulePrefix}-${id}`
}

const tryResolvePluginPath = function (pluginPath, base) {
  try {
    return require.resolve(pluginPath, { paths: [base] })
  } catch {}
}
