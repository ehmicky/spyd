import { normalizeConfigProps } from './lib/main.js'
import { COMMANDS_PROPS } from './properties.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (config, command, configInfos) {
  const definitions = COMMANDS_PROPS[command]
  const context = getContext(configInfos)
  const configA = await normalizeConfigProps(config, definitions, { context })
  const configB = postNormalizeConfig(configA)
  return configB
}

const getContext = function (configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return { configInfos: configInfosA }
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
