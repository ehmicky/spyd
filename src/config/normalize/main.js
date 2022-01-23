import { normalizeConfigProps } from './lib/main.js'
import { DEFINITIONS } from './prop_defs.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (config, command, configInfos) {
  const context = getContext(command, configInfos)
  const configA = await normalizeConfigProps(config, DEFINITIONS, { context })
  const configB = postNormalizeConfig(configA)
  return configB
}

const getContext = function (command, configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return { command, configInfos: configInfosA }
}

// Perform normalization that is difficult to do with the main configuration
// logic
const postNormalizeConfig = function (config) {
  const configA = flattenTasks(config)
  return configA
}

const flattenTasks = function (config) {
  return config.tasks === undefined
    ? config
    : { ...config, tasks: config.tasks.flat() }
}
