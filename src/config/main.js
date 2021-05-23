import envCi from 'env-ci'

import { addPlugins } from '../plugin/add.js'

import { addDefaultConfig } from './default.js'
import { loadConfig } from './load.js'
import { normalizeConfig } from './normalize.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const config = await loadConfig(configFlags)

  const configA = addDefaultConfig(config, command)

  const configB = addEnvInfo(configA)
  const configC = normalizeConfig(configB)
  const configD = await addPlugins(configC, command)
  return configD
}

const addEnvInfo = function (config) {
  const envInfo = envCi({ cwd: config.cwd })
  return { ...config, envInfo }
}
