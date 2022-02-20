import omit from 'omit.js'

import { normalizeReporters } from '../../report/config/main.js'
import { REPORTER_PLUGIN_TYPE } from '../../report/reporters/plugin/main.js'
import { RUNNER_PLUGIN_TYPE } from '../../runners/plugin/main.js'
import { removeEmptyValues } from '../empty.js'
import { isAmongCommands } from '../normalize/pick.js'

import { handlePluginsError } from './error.js'
import { getPlugins } from './lib/main.js'

// Retrieve the name of all plugin top properties
export const getPluginsConfigProps = function () {
  return PLUGIN_TYPES.map(getPluginTypeName)
}

// Handle the configuration plugins: runners and reporters
export const normalizePluginsConfig = async function ({
  config,
  command,
  context,
  cwd,
}) {
  const { includedPluginTypes, excludedPluginTypes } = splitPluginTypes(command)
  const configA = excludePlugins(config, excludedPluginTypes)
  const allPluginsEntries = await Promise.all(
    includedPluginTypes.map((pluginType) =>
      normalizePluginConfigs({ pluginType, config: configA, context, cwd }),
    ),
  )
  const allPlugins = Object.fromEntries(allPluginsEntries)
  const configB = { ...configA, ...allPlugins }
  const configC = normalizeReporters(configB, command)
  return configC
}

const splitPluginTypes = function (command) {
  const includedPluginTypes = PLUGIN_TYPES.filter((pluginType) =>
    shouldKeepPluginType(pluginType, command),
  )
  const excludedPluginTypes = PLUGIN_TYPES.filter(
    (pluginType) => !shouldKeepPluginType(pluginType, command),
  )
  return { includedPluginTypes, excludedPluginTypes }
}

const PLUGIN_TYPES = [RUNNER_PLUGIN_TYPE, REPORTER_PLUGIN_TYPE]

const shouldKeepPluginType = function (pluginType, command) {
  return isAmongCommands(pluginType.commands, command)
}

const excludePlugins = function (config, excludedPluginTypes) {
  const omittedPlugins = excludedPluginTypes.map(getPluginTypeName)
  return omit.default(config, omittedPlugins)
}

const getPluginTypeName = function ({ name }) {
  return name
}

const normalizePluginConfigs = async function ({
  pluginType,
  pluginType: { name },
  config,
  context,
  cwd,
}) {
  const pluginConfigs = config[name]
  const plugins = await addConfigPlugins({
    pluginConfigs,
    pluginType,
    config,
    context,
    cwd,
  })
  const pluginsA = plugins.map(normalizePlugin)
  return [name, pluginsA]
}

const addConfigPlugins = async function ({
  pluginConfigs,
  pluginType,
  config,
  context,
  cwd,
}) {
  try {
    return await getPlugins(pluginConfigs, {
      ...pluginType,
      sharedConfig: config,
      context,
      cwd,
    })
  } catch (error) {
    throw handlePluginsError(error)
  }
}

const normalizePlugin = function ({ plugin, config }) {
  return removeEmptyValues({ ...plugin, config })
}
