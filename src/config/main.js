import envCi from 'env-ci'

import { normalizeDeltas } from '../delta/main.js'
import { addPlugins } from '../plugin/add.js'

import { addDefaultConfig } from './default.js'
import { loadConfig } from './load.js'
import { normalizeConfig } from './normalize.js'
import { setConfigAbsolutePaths } from './path.js'
import { validateConfig } from './validate.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const { config, configInfos } = await loadConfig(configFlags)

  validateConfig(config)

  const configA = addDefaultConfig(config, command)

  const configB = normalizeConfig(configA)
  const configC = setConfigAbsolutePaths(configB, configInfos)

  const configD = await addPlugins(configC, command)

  const configE = addEnvInfo(configD)
  const configF = normalizeDeltas(configE)
  return configF
}

const addEnvInfo = function (config) {
  const envInfo = envCi({ cwd: config.cwd })
  return { ...config, envInfo }
}
