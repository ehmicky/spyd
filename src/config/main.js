import filterObj from 'filter-obj'

import { addDefaultConfig } from './default.js'
import { loadConfig } from './load.js'
import { preNormalizeConfig, normalizeConfig } from './normalize.js'
import { validateConfig } from './validate.js'

// Retrieve configuration
// `cwd` and `config` cannot be specified in the configuration file nor in
// environment variables
export const getConfig = async function (action, config = {}) {
  const { settings, ...configFlags } = filterObj(config, isDefined)

  validateConfig({ settings })

  const configA = await loadConfig(settings, configFlags)

  validateConfig(configA)

  const configB = preNormalizeConfig(configA)
  const configC = addDefaultConfig(configB, action)

  const configD = await normalizeConfig(configC)
  return configD
}

const isDefined = function (key, value) {
  return value !== undefined
}
