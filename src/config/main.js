import { addDefaultConfig } from './default.js'
import { loadConfig } from './load/main.js'
import { normalizeConfig } from './normalize.js'
import { normalizeConfigPaths } from './path.js'
import { pickCommandConfig } from './pick.js'
import { addPlugins } from './plugin/add.js'
import { validateConfig } from './validate.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const { config, configInfos } = await loadConfig(configFlags)
  validateConfig(config)
  const configA = addDefaultConfig(config, command)
  const configB = pickCommandConfig(configA, command)
  const configC = normalizeConfig(configB)
  const configD = await normalizeConfigPaths(configC, configInfos)
  const configE = await addPlugins(configD, command)
  return configE
}
