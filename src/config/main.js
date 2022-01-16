import { addDefaultConfig } from './default.js'
import { loadConfig } from './load/main.js'
import { normalizeConfig } from './normalize.js'
import { addPlugins } from './plugin/add.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const { config, configInfos } = await loadConfig(configFlags)
  const configA = addDefaultConfig(config)
  const configB = normalizeConfig(configA, command, configInfos)
  const configC = await addPlugins(configB, command)
  return configC
}
