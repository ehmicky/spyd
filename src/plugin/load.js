import { createRequire } from 'module'

import { PluginError, UserError } from '../error/main.js'

// Import plugin's code
export const loadPlugins = async function ({
  ids,
  type,
  modulePrefix,
  builtins,
  isCombinationCategory,
}) {
  return await Promise.all(
    ids.map((id) =>
      loadPlugin({ id, type, modulePrefix, builtins, isCombinationCategory }),
    ),
  )
}

const loadPlugin = async function ({
  id,
  type,
  modulePrefix,
  builtins,
  isCombinationCategory,
}) {
  const moduleId = getModuleId(id, isCombinationCategory)
  const plugin = await importPlugin({ moduleId, type, modulePrefix, builtins })
  return { ...plugin, id, moduleId }
}

// We allow plugin identifiers to be prefixed with an arbitrary string.
//  - This allows using the same plugin twice but with different configs.
//  - This is especially useful for using the same reporter but with different
//    `output`
// This does not apply to plugins which do not create combinations
// (e.g. runners) because those should use variations instead.
// Since the list of plugin module names is unknown, users must indicate using
// this by the usage of a delimiter character.
const getModuleId = function (id, isCombinationCategory) {
  return isCombinationCategory ? id : id.split(CUSTOM_ID_DELIMITER)[0]
}

const CUSTOM_ID_DELIMITER = '_'

const importPlugin = async function ({
  moduleId,
  type,
  modulePrefix,
  builtins,
}) {
  const builtin = builtins[moduleId]

  if (builtin !== undefined) {
    return builtin
  }

  const moduleName = `${modulePrefix}${moduleId}`
  const pluginPath = getPluginPath(moduleName, type, '.')

  try {
    return await import(pluginPath)
  } catch (error) {
    throw new PluginError(
      `Could not load "${type}" module "${moduleId}"\n\n${error.stack}`,
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
// TODO: use import.meta.resolve() when available
export const getPluginPath = function (moduleName, type, base) {
  const { resolve } = createRequire(new URL(base, import.meta.url))

  try {
    return resolve(moduleName)
  } catch (error) {
    throw new UserError(`Cannot find ${type} "${moduleName}".
This Node module was not found, please ensure it is installed.

${error.stack}`)
  }
}
