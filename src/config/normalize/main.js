import { normalizeConfigProps } from './lib/main.js'
import { COMMANDS_PROPS } from './properties.js'

// Normalize the configuration properties, including default values and
// validation.
export const normalizeConfig = async function (config, command, configInfos) {
  const definitions = COMMANDS_PROPS[command]
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  const configA = await normalizeConfigProps(config, definitions, configInfosA)
  const configB = postNormalizeConfig(configA)
  return configB
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
