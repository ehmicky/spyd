import { getPluginConfig } from './config.js'
import { importPlugin } from './import.js'
import { normalizePlugin } from './normalize.js'

// Import plugin's code
export const loadPlugins = async function ({
  pluginType,
  config,
  topConfig,
  context,
  configInfos,
}) {
  const ids = config[pluginType.selectProp.name]
  return ids === undefined
    ? []
    : await Promise.all(
        ids.map((id) =>
          loadPlugin(
            { id, config, topConfig, context, configInfos },
            pluginType,
          ),
        ),
      )
}

const loadPlugin = async function (
  { id, config, topConfig, context, configInfos },
  {
    name,
    configProp: { name: configPropName },
    modulePrefix,
    builtins,
    multiple,
    shape,
    sharedProps,
    topPropNames,
  },
) {
  const plugin = await importPlugin({
    id,
    name,
    modulePrefix,
    builtins,
    multiple,
  })
  const pluginA = { ...plugin }
  const { config: pluginConfigDefinitions, ...pluginB } = await normalizePlugin(
    pluginA,
    shape,
    topPropNames,
  )
  const pluginC = { ...pluginB, id }
  const pluginConfig = await getPluginConfig({
    config,
    topConfig,
    context,
    configInfos,
    configPropName,
    pluginConfigDefinitions,
    plugin: pluginC,
    sharedProps,
  })
  return { ...pluginC, config: pluginConfig }
}
