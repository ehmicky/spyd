import { addDefaultConfig } from './default.js'
import { loadConfig } from './load/main.js'
import { normalizeConfig } from './normalize.js'
import { pickCommandConfig } from './pick.js'
import { addPlugins } from './plugin/add.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const { config, configInfos } = await loadConfig(configFlags)
  const configA = addDefaultConfig(config, command)
  const configB = pickCommandConfig(configA, command)
  const configC = normalizeConfig(configB, configInfos)
  const configD = await addPlugins(configC, command)
  return configD
}
