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
    type,
    selectProp: { name: selectName },
    configProp,
    modulePrefix,
    builtins,
    isCombinationDimension,
    mainShape,
    sharedConfig,
    sharedConfigPropNames,
  },
) {
  const plugin = await importPlugin({
    id,
    type,
    selectName,
    modulePrefix,
    builtins,
    isCombinationDimension,
  })
  const pluginA = { ...plugin }
  const { config: pluginConfigDefinitions, ...pluginB } = await normalizePlugin(
    pluginA,
    mainShape,
    sharedConfigPropNames,
  )
  const pluginC = { ...pluginB, id }
  const pluginConfig = await getPluginConfig({
    config,
    topConfig,
    context,
    configInfos,
    configProp,
    pluginConfigDefinitions,
    plugin: pluginC,
    sharedConfig,
  })
  return { ...pluginC, config: pluginConfig }
}
