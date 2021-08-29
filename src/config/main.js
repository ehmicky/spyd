import { normalizeDeltas } from '../history/delta/main.js'

import { addDefaultConfig } from './default.js'
import { loadConfig } from './load.js'
import { normalizeConfig } from './normalize.js'
import { normalizeConfigPaths } from './path.js'
import { addPlugins } from './plugin/add.js'
import { validateConfig } from './validate.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const { config, configInfos } = await loadConfig(configFlags)

  validateConfig(config)

  const configA = addDefaultConfig(config, command)

  const configB = normalizeConfig(configA)
  const configC = await normalizeConfigPaths(configB, configInfos)
  const configD = normalizeDeltas(configC)

  const configE = await addPlugins(configD, command)
  return configE
}
