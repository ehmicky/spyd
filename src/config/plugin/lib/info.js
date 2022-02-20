import { wrapError } from '../../../error/wrap.js'

import { normalizePluginConfig } from './config.js'
import { PluginError } from './error.js'
import { importPlugin } from './import.js'
import { normalizeItem } from './item.js'
import { normalizeShape } from './shape.js'

// Get each `pluginInfo`, i.e. normalized `plugin` + `pluginConfig`
export const getPluginInfo = async function (
  pluginConfig,
  {
    name,
    builtins,
    pluginProp,
    shape,
    modulePrefix,
    item,
    context,
    cwd,
    sharedConfig,
    sharedPropNames,
  },
) {
  const {
    [pluginProp]: id,
    moduleId,
    ...pluginConfigA
  } = await normalizeItem(pluginConfig, {
    name,
    builtins,
    pluginProp,
    modulePrefix,
    cwd,
  })

  try {
    const { plugin, path } = await importPlugin(id, name, builtins)
    const { config: pluginConfigDefinitions, ...pluginA } =
      await normalizeShape({
        plugin,
        shape,
        sharedPropNames,
        context,
        moduleId,
      })
    const pluginConfigB = await normalizePluginConfig({
      name,
      sharedConfig,
      pluginConfig: pluginConfigA,
      plugin: pluginA,
      context,
      cwd,
      pluginConfigDefinitions,
      item,
    })
    return { plugin: pluginA, path, config: pluginConfigB }
  } catch (error) {
    throw handlePluginError(error, id)
  }
}

const handlePluginError = function (error, id) {
  return error instanceof PluginError
    ? wrapError(error, `Invalid plugin "${id}":`)
    : error
}
