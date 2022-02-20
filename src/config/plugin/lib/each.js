import { wrapError } from '../../../error/wrap.js'

import { normalizePluginConfig } from './config.js'
import { handleDuplicatePlugins } from './duplicates.js'
import { PluginError } from './error.js'
import { importPlugin } from './import.js'
import { normalizeShape } from './shape.js'

// Handle each individual `pluginConfig`
export const addPlugin = async function (
  { duplicates, builtins, pluginProp, shape, item },
  {
    pluginConfig,
    index,
    pluginConfigs,
    sharedPropNames,
    sharedConfig,
    context,
    cwd,
  },
) {
  const {
    pluginConfig: { [pluginProp]: id, ...pluginConfigA },
    duplicateConfigs,
  } = handleDuplicatePlugins({
    pluginConfig,
    index,
    pluginConfigs,
    duplicates,
    pluginProp,
  })

  if (id === undefined) {
    return
  }

  try {
    return await getPlugin({
      pluginConfig: pluginConfigA,
      id,
      duplicateConfigs,
      builtins,
      shape,
      item,
      sharedPropNames,
      sharedConfig,
      context,
      cwd,
    })
  } catch (error) {
    throw handlePluginError(error, id)
  }
}

const getPlugin = async function ({
  pluginConfig: { moduleId, parents, ...pluginConfig },
  id,
  duplicateConfigs,
  builtins,
  shape,
  item,
  sharedPropNames,
  sharedConfig,
  context,
  cwd,
}) {
  const { plugin, path } = await importPlugin(id, parents, builtins)

  const { config: pluginConfigDefinitions, ...pluginA } = await normalizeShape({
    plugin,
    shape,
    sharedPropNames,
    context,
    moduleId,
  })
  const pluginConfigA = await normalizePluginConfig({
    parents,
    duplicateConfigs,
    sharedConfig,
    pluginConfig,
    plugin: pluginA,
    context,
    cwd,
    pluginConfigDefinitions,
    item,
  })
  return { plugin: pluginA, path, config: pluginConfigA }
}

const handlePluginError = function (error, id) {
  return error instanceof PluginError
    ? wrapError(error, `Invalid plugin "${id}":`)
    : error
}
