import { normalizeReporters } from '../../report/config/main.js'
import { REPORTER_PLUGIN_TYPE } from '../../report/reporters/plugin/main.js'
import { RUNNER_PLUGIN_TYPE } from '../../runners/plugin/main.js'
import { removeEmptyValues } from '../empty.js'

import { handlePluginsError } from './error.js'
import { getPlugins } from './lib/main.js'

// Handle the configuration plugins: runners and reporters
export const normalizePluginsConfig = async function ({
  config,
  command,
  context,
  cwd,
}) {
  const allPluginsEntries = await Promise.all(
    PLUGIN_TYPES.map((pluginType) =>
      normalizePluginConfigs({ pluginType, config, context, cwd }),
    ),
  )
  const configA = Object.assign({}, config, ...allPluginsEntries)
  const configB = normalizeReporters(configA, command)
  return configB
}

const PLUGIN_TYPES = [RUNNER_PLUGIN_TYPE, REPORTER_PLUGIN_TYPE]

const normalizePluginConfigs = async function ({
  pluginType,
  pluginType: { name },
  config,
  context,
  cwd,
}) {
  const pluginConfigs = config[name]

  if (pluginConfigs === undefined) {
    return {}
  }

  try {
    const plugins = await getPlugins(pluginConfigs, {
      ...pluginType,
      pluginProp: 'id',
      sharedConfig: config,
      context,
      cwd,
    })
    const pluginsA = plugins.map(normalizePlugin)
    return { [name]: pluginsA }
  } catch (error) {
    throw handlePluginsError(error)
  }
}

const normalizePlugin = function ({ plugin, config }) {
  return removeEmptyValues({ ...plugin, config })
}
