import { createRequire } from 'module'

import { PluginError, UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'
import { PLUGINS_IMPORT_BASE } from '../normalize/cwd.js'

import { getPluginConfig } from './config.js'
import { getModuleId } from './id.js'
import { normalizePlugin } from './normalize.js'

// Import plugin's code
export const loadPlugins = async function ({
  pluginType,
  config,
  topConfig,
  context,
}) {
  const ids = config[pluginType.selectProp]
  return ids === undefined
    ? []
    : await Promise.all(
        ids.map((id) =>
          loadPlugin({ id, config, topConfig, context }, pluginType),
        ),
      )
}

const loadPlugin = async function (
  { id, config, topConfig, context },
  {
    type,
    selectProp,
    configProp,
    modulePrefix,
    builtins,
    isCombinationDimension,
    mainDefinitions,
    topDefinitions,
    topConfigPropNames,
  },
) {
  const plugin = await importPlugin({
    id,
    type,
    selectProp,
    modulePrefix,
    builtins,
    isCombinationDimension,
  })
  const pluginA = { ...plugin }
  const { config: pluginConfigDefinitions, ...pluginB } = await normalizePlugin(
    pluginA,
    mainDefinitions,
    topConfigPropNames,
  )
  const pluginC = { ...pluginB, id }
  const pluginConfig = await getPluginConfig({
    config,
    topConfig,
    context,
    configProp,
    pluginConfigDefinitions,
    plugin: pluginC,
    topDefinitions,
  })
  return { ...pluginC, config: pluginConfig }
}

// Builtin modules are lazy loaded for performance reasons.
// The return value is shallow merged to make it a plain object instead of
// a dynamic `Module` instance.
const importPlugin = async function ({
  id,
  type,
  selectProp,
  modulePrefix,
  builtins,
  isCombinationDimension,
}) {
  const moduleId = getModuleId(id, type, isCombinationDimension)
  const builtin = builtins[moduleId]

  if (builtin !== undefined) {
    return await builtin()
  }

  const moduleName = `${modulePrefix}${moduleId}`
  const pluginPath = safeGetPluginPath({
    moduleName,
    type,
    selectProp,
    base: PLUGINS_IMPORT_BASE,
  })

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
const safeGetPluginPath = function ({ moduleName, type, selectProp, base }) {
  try {
    return getPluginPath(moduleName, type, base)
  } catch (error) {
    throw wrapError(error, `Configuration property "${selectProp}"`, UserError)
  }
}

export const getPluginPath = function (moduleName, type, base) {
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
