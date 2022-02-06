import { normalizeReporters } from '../../report/config/main.js'

import { addPlugins } from './lib/main.js'

// Handle the configuration all spyd-specific plugins: reporters and runners
export const normalizePluginsConfig = async function ({
  config,
  command,
  context,
  configInfos,
}) {
  const configA = await addPlugins(config, context, configInfos)
  const configB = normalizeReporters(configA, command)
  return configB
}
