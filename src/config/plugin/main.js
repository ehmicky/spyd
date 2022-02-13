import { normalizeReporters } from '../../report/config/main.js'
import { REPORTER_PLUGIN_TYPE } from '../../report/reporters/plugin/main.js'
import { RUNNER_PLUGIN_TYPE } from '../../runners/plugin/main.js'
import { removeEmptyValues } from '../empty.js'
import { isAmongCommands } from '../normalize/pick.js'

import { addPlugins } from './lib/main.js'

// Retrieve the name of all plugin top properties
export const getPluginsConfigProps = function () {
  return PLUGIN_TYPES.map(getPluginTypeName)
}

const getPluginTypeName = function ({ name }) {
  return name
}

// Handle the configuration plugins: runners and reporters
export const normalizePluginsConfig = async function ({
  config,
  command,
  context,
  cwd,
}) {
  const configEntries = await Promise.all(
    Object.entries(config).map(
      normalizeConfigProp.bind(undefined, { command, config, context, cwd }),
    ),
  )
  const configA = Object.fromEntries(configEntries.filter(Boolean))
  const configB = normalizeReporters(configA, command)
  return configB
}

const normalizeConfigProp = async function (
  { command, config, context, cwd },
  [propName, propValue],
) {
  const pluginType = PLUGIN_TYPES.find(({ name }) => name === propName)

  if (pluginType === undefined) {
    return [propName, propValue]
  }

  const { commands, ...pluginTypeA } = pluginType

  if (!isAmongCommands(commands, command)) {
    return
  }

  const plugins = await addPlugins(propValue, pluginTypeA, {
    sharedConfig: config,
    context,
    cwd,
  })
  const pluginsA = plugins.map(normalizePlugin)
  return [propName, pluginsA]
}

const PLUGIN_TYPES = [RUNNER_PLUGIN_TYPE, REPORTER_PLUGIN_TYPE]

const normalizePlugin = function ({ plugin, config }) {
  return removeEmptyValues({ ...plugin, config })
}
