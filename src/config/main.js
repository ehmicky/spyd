import { cwd as getProcessCwd } from 'process'

import envCi from 'env-ci'

import { addPlugins } from '../plugin/add.js'
import { normalizePluginsConfig } from '../plugin/normalize.js'

import { addDefaultConfig } from './default.js'
import { loadConfig } from './load.js'
import { normalizeConfig } from './normalize.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const processCwd = getProcessCwd()

  const config = await loadConfig(configFlags, processCwd)

  const configA = addDefaultConfig({ config, command, processCwd })

  const configB = addEnvInfo(configA)
  const configC = normalizeConfig(configB)
  const configD = await addPlugins(configC)
  const configE = normalizePluginsConfig(configD, command)
  return configE
}

const addEnvInfo = function (config) {
  const envInfo = envCi({ cwd: config.cwd })
  return { ...config, envInfo }
}
