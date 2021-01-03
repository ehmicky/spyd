import camelcase from 'camelcase'

import { checkObject } from '../config/check.js'
import { PluginError } from '../error/main.js'

// Import plugin's code and add its configuration
export const loadPlugins = async function ({
  ids,
  type,
  configPrefix,
  modulePrefix,
  config,
  builtins,
}) {
  return await Promise.all(
    ids.map((id) =>
      loadPlugin({ id, type, configPrefix, modulePrefix, config, builtins }),
    ),
  )
}

const loadPlugin = async function ({
  id,
  type,
  configPrefix,
  modulePrefix,
  config,
  builtins,
}) {
  const plugin = await importPlugin({ id, type, modulePrefix, builtins })
  const pluginConfig = getPluginConfig(id, config, configPrefix)
  return { ...plugin, id, config: pluginConfig }
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

const getPluginConfig = function (id, config, configPrefix) {
  const configPropName = camelcase([configPrefix, id])
  const pluginConfig = config[configPropName]

  if (pluginConfig === undefined) {
    return {}
  }

  checkObject(pluginConfig, configPropName)
  return pluginConfig
}
