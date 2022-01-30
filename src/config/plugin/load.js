import { createRequire } from 'module'

import { PluginError, UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'
import { PLUGINS_IMPORT_BASE } from '../normalize/cwd.js'

import { getPluginConfig } from './config.js'
import { getModuleId } from './id.js'
import { normalizePlugin } from './normalize.js'

// Import plugin's code
export const loadPlugins = async function (pluginType, config, context) {
  const ids = config[pluginType.selectProp]
  return ids === undefined
    ? []
    : await Promise.all(
        ids.map((id) => loadPlugin({ id, config, context }, pluginType)),
      )
}

const loadPlugin = async function (
  { id, config, context },
  {
    type,
    configProp,
    modulePrefix,
    builtins,
    topProps,
    isCombinationDimension,
    mainDefinitions,
  },
) {
  const moduleId = getModuleId(id, type, isCombinationDimension)
  const plugin = await importPlugin({ moduleId, type, modulePrefix, builtins })
  const pluginA = { ...plugin }
  const { config: pluginConfigDefinitions, ...pluginB } = await normalizePlugin(
    pluginA,
    mainDefinitions,
    topProps,
  )
  const pluginConfig = await getPluginConfig({
    id,
    config,
    context,
    configProp,
    topProps,
    pluginConfigDefinitions,
  })
  return { ...pluginB, id, config: pluginConfig }
}

// Builtin modules are lazy loaded for performance reasons
const importPlugin = async function ({
  moduleId,
  type,
  modulePrefix,
  builtins,
}) {
  const builtin = builtins[moduleId]

  if (builtin !== undefined) {
    return await builtin()
  }

  const moduleName = `${modulePrefix}${moduleId}`
  const pluginPath = getPluginPath(moduleName, type, PLUGINS_IMPORT_BASE)

  try {
    return await import(pluginPath)
  } catch (error) {
    throw wrapError(
      error,
      `Could not load "${type}" module "${moduleId}"\n\n`,
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
export const getPluginPath = function (moduleName, type, base) {
  const { resolve } = createRequire(new URL(base, import.meta.url))

  try {
    return resolve(moduleName)
  } catch (error) {
    throw wrapError(
      error,
      `Cannot find ${type} "${moduleName}".
This Node module was not found, please ensure it is installed.\n\n`,
      UserError,
    )
  }
}
