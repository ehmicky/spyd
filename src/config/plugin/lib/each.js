import { wrapError } from '../../../error/wrap.js'

import { normalizePluginConfig } from './config.js'
import { PluginError } from './error.js'
import { importPlugin } from './import.js'
import { normalizeShape } from './shape.js'

// Handle each individual `pluginConfig`
export const addPlugin = async function (
  { name, builtins, pluginProp, shape, item },
  {
    pluginConfig: { [pluginProp]: id, moduleId, ...pluginConfig },
    index,
    pluginsCount,
    sharedPropNames,
    context,
    cwd,
  },
) {
  if (id === undefined) {
    return
  }

  const propName = getPropName(name, index, pluginsCount)

  try {
    const { plugin, path } = await importPlugin(id, propName, builtins)

    const { config: pluginConfigDefinitions, ...pluginA } =
      await normalizeShape({
        plugin,
        shape,
        sharedPropNames,
        context,
        moduleId,
      })
    const pluginConfigA = await normalizePluginConfig({
      propName,
      pluginConfig,
      plugin: pluginA,
      context,
      cwd,
      pluginConfigDefinitions,
      item,
    })
    return { plugin: pluginA, path, config: pluginConfigA }
  } catch (error) {
    throw handlePluginError(error, id)
  }
}

const getPropName = function (name, index, pluginsCount) {
  return pluginsCount === 1 ? name : `${name}[${index}]`
}

const handlePluginError = function (error, id) {
  return error instanceof PluginError
    ? wrapError(error, `Invalid plugin "${id}":`)
    : error
}
