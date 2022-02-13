import { createRequire } from 'module'
import { isAbsolute } from 'path'
import { pathToFileURL } from 'url'

import { PluginError, UserError } from '../../../error/main.js'
import { wrapError } from '../../../error/wrap.js'
import { PLUGINS_IMPORT_BASE } from '../../normalize/cwd.js'

// Builtin modules are lazy loaded for performance reasons.
// The return value is shallow merged to make it a plain object instead of
// a dynamic `Module` instance.
export const importPlugin = async function ({
  id,
  propName,
  modulePrefix,
  builtins,
}) {
  const plugin = await importPluginById({
    id,
    propName,
    modulePrefix,
    builtins,
  })
  return { ...plugin }
}

const importPluginById = async function ({
  id,
  propName,
  modulePrefix,
  builtins,
}) {
  const builtin = builtins[id]

  if (builtin !== undefined) {
    return await builtin()
  }

  const pluginPath = safeGetPluginPath(id, propName, modulePrefix)

  try {
    return await import(pathToFileURL(pluginPath))
  } catch (error) {
    throw wrapError(
      error,
      `Could not load "${propName}.id" "${id}"\n\n`,
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
const safeGetPluginPath = function (id, propName, modulePrefix) {
  if (isAbsolute(id)) {
    return id
  }

  const moduleName = `${modulePrefix}${id}`

  try {
    return getPluginPath(moduleName, PLUGINS_IMPORT_BASE)
  } catch (error) {
    throw wrapError(
      error,
      `The configuration property "${propName}.id"`,
      UserError,
    )
  }
}

// TODO: use import.meta.resolve() when available
const getPluginPath = function (moduleName, base) {
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
