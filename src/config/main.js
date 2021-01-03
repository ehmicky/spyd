import filterObj from 'filter-obj'

import { addPlugins } from '../plugin/add.js'

import { addDefaultConfig } from './default.js'
import { loadConfig } from './load.js'
import { normalizeConfig } from './normalize.js'
import { validateConfig } from './validate.js'

// Retrieve configuration
// `cwd` and `config` cannot be specified in the configuration file nor in
// environment variables
export const getConfig = async function (action, configFlags = {}) {
  const configFlagsA = filterObj(configFlags, isDefined)

  const { config: configA, cwd } = await loadConfig(configFlagsA)

  validateConfig(configA)
  const configB = addDefaultConfig(configA, action)

  const configC = { ...configB, cwd }
  const configD = normalizeConfig(configC)
  const configE = await addPlugins(configD)
  return configE
}

const isDefined = function (key, value) {
  return value !== undefined
}
