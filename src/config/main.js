import { loadConfig } from './load/main.js'
import { normalizeConfig } from './normalize.js'
import { addPlugins } from './plugin/add.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const { config, configInfos } = await loadConfig(configFlags)
  const configA = normalizeConfig(config, command, configInfos)
  const configB = await addPlugins(configA, command)
  return configB
}
