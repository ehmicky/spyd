import { cwd as getProcessCwd } from 'process'

import envCi from 'env-ci'

import { addPlugins } from '../plugin/add.js'

import { addDefaultConfig } from './default.js'
import { loadConfig } from './load.js'
import { normalizeConfig } from './normalize.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const processCwd = getProcessCwd()

  const config = await loadConfig(configFlags, processCwd)

  const envInfo = getEnvInfo(processCwd, config)
  const configA = addDefaultConfig({ config, command, envInfo, processCwd })

  const configB = { ...configA, envInfo }
  const configC = normalizeConfig(configB)
  const configD = await addPlugins(configC)
  return configD
}

const getEnvInfo = function (processCwd, { cwd = processCwd }) {
  return envCi({ cwd })
}
