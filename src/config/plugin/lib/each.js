import { wrapError } from '../../../error/wrap.js'

import { normalizePluginConfig } from './config.js'
import { PluginError } from './error.js'
import { importPlugin } from './import.js'
import { normalizeShape } from './shape.js'

// Handle each individual `pluginConfig`
export const addPlugin = async function (
  pluginConfig,
  {
    builtins,
    pluginProp,
    shape,
    item,
    context,
    cwd,
    sharedConfig,
    sharedPropNames,
  },
) {
  const { [pluginProp]: id, moduleId, parents, ...pluginConfigA } = pluginConfig

  try {
    const { plugin, path } = await importPlugin(id, parents, builtins)
    const { config: pluginConfigDefinitions, ...pluginA } =
      await normalizeShape({
        plugin,
        shape,
        sharedPropNames,
        context,
        moduleId,
      })
    const pluginConfigB = await normalizePluginConfig({
      parents,
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
