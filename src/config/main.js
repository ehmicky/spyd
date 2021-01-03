import filterObj from 'filter-obj'

import { addDefaultConfig } from './default.js'
import { loadConfig } from './load.js'
import { normalizeConfig } from './normalize.js'
import { validateConfig } from './validate.js'

// Retrieve configuration
// `cwd` and `config` cannot be specified in the configuration file nor in
// environment variables
export const getConfig = async function (action, configFlags = {}) {
  const configFlagsA = filterObj(configFlags, isDefined)

  const configA = await loadConfig(configFlagsA)

  validateConfig(configA)
  const configB = addDefaultConfig(configA, action)

  const configC = await normalizeConfig(configB)
  return configC
}

const isDefined = function (key, value) {
  return value !== undefined
}
