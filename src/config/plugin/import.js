import { createRequire } from 'module'

import { PluginError, UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'
import { PLUGINS_IMPORT_BASE } from '../normalize/cwd.js'

import { getModuleId } from './id.js'

// Builtin modules are lazy loaded for performance reasons.
// The return value is shallow merged to make it a plain object instead of
// a dynamic `Module` instance.
export const importPlugin = async function ({
  id,
  selectPropName,
  modulePrefix,
  builtins,
  multiple,
}) {
  const moduleId = getModuleId(id, multiple, selectPropName)
  const builtin = builtins[moduleId]

  if (builtin !== undefined) {
    return await builtin()
  }

  const moduleName = `${modulePrefix}${moduleId}`
  const pluginPath = safeGetPluginPath({
    moduleName,
    selectPropName,
    base: PLUGINS_IMPORT_BASE,
  })

  try {
    return await import(pluginPath)
  } catch (error) {
    throw wrapError(
      error,
      `Could not load "${selectPropName}" module "${moduleId}"\n\n`,
      PluginError,
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
const safeGetPluginPath = function ({ moduleName, selectPropName, base }) {
  try {
    return getPluginPath(moduleName, base)
  } catch (error) {
    throw wrapError(
      error,
      `Configuration property "${selectPropName}"`,
      UserError,
    )
  }
}

export const getPluginPath = function (moduleName, base) {
  const { resolve } = createRequire(new URL(base, import.meta.url))

  try {
    return resolve(moduleName)
  } catch (error) {
    throw wrapError(
      error,
      `must be a valid package name: "${moduleName}".
This Node module was not found, please ensure it is installed.\n\n`,
    )
  }
}
