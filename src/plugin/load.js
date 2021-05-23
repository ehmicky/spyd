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

  const pluginPath = getPluginPath({ id, modulePrefix, type, base: '.' })

  try {
    return await import(pluginPath)
  } catch (error) {
    throw new PluginError(
      `Could not load "${type}" module "${id}"\n\n${error.stack}`,
    )
  }
}

// Find the local file path of a plugin.
// We enforce a naming convention for all plugins.
// All plugins are Node modules.
// We do not allow npm @scope because:
//  - This is simpler for users
//  - This prevent the confusion (which could be malicious) created by the
//    ambiguity
export const getPluginPath = function ({ id, modulePrefix, type, base }) {
  const moduleName = `${modulePrefix}${id}`

  try {
    return require.resolve(moduleName, { paths: [base] })
  } catch (error) {
    throw new UserError(`Cannot find ${type} "${id}"
No Node.js module "${moduleName}" was found, please ensure it is installed.

${error.stack}`)
  }
}
