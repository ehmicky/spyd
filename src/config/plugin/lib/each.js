import { normalizePluginConfig } from './config.js'
import { importPlugin } from './import.js'
import { normalizeShape } from './shape.js'

// Handle each individual `pluginConfig`
export const addPlugin = async function (
  { name, modulePrefix, builtins, shape, item },
  {
    pluginConfig: { id, ...pluginConfig },
    index,
    pluginsCount,
    sharedPropNames,
    sharedConfig,
    context,
    cwd,
  },
) {
  const propName = getPropName(name, index, pluginsCount)
  const plugin = await importPlugin({ id, propName, modulePrefix, builtins })
  const { config: pluginConfigDefinitions, ...pluginA } = await normalizeShape(
    plugin,
    shape,
    sharedPropNames,
  )
  const pluginConfigA = await normalizePluginConfig({
    propName,
    sharedConfig,
    pluginConfig,
    plugin: pluginA,
    context,
    cwd,
    pluginConfigDefinitions,
    item,
  })
  return { ...pluginA, config: pluginConfigA }
}

const getPropName = function (name, index, pluginsCount) {
  return pluginsCount === 1 ? name : `${name}[${index}]`
}
