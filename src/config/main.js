import envCi from 'env-ci'

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
  const configB = setConfigAbsolutePaths(configA, configInfos)

  const configC = addEnvInfo(configB)
  const configD = normalizeConfig(configC)
  const configE = await addPlugins(configD, command)
  return configE
}

const addEnvInfo = function (config) {
  const envInfo = envCi({ cwd: config.cwd })
  return { ...config, envInfo }
}
