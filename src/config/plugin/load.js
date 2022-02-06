import { getPluginConfig } from './config.js'
import { importPlugin } from './import.js'
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
