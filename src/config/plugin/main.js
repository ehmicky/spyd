import { normalizeReporters } from '../../report/config/main.js'
import { REPORTER_PLUGIN_TYPE } from '../../report/reporters/plugin.js'
import { RUNNER_PLUGIN_TYPE } from '../../runners/plugin.js'

import { addPlugins } from './lib/main.js'
import { getPluginsProps } from './lib/main_props.js'

// Handle the configuration all spyd-specific plugins: runners and reporters
export const normalizePluginsConfig = async function ({
  config,
  command,
  context,
  configInfos,
}) {
  const configA = await addPlugins({
    config,
    pluginTypes: PLUGIN_TYPES,
    context,
    configInfos,
  })
  const configB = normalizeReporters(configA, command)
  return configB
}

// Retrieve the name of all plugin top properties
export const getPluginsConfigProps = function () {
  return getPluginsProps(PLUGIN_TYPES)
}

// All plugin types
const PLUGIN_TYPES = [RUNNER_PLUGIN_TYPE, REPORTER_PLUGIN_TYPE]
