import { loadConfig } from './load/main.js'
import { normalizeConfig } from './normalize/main.js'
import { DEFINITIONS } from './normalize/prop_defs.js'
import { addPlugins } from './plugin/add.js'

// Retrieve configuration
export const getConfig = async function (
  command,
  { config: configOpt, ...configFlags } = {},
) {
  const { config, configInfos } = await loadConfig(configOpt, configFlags)
  const configA = await normalizeConfig(config, DEFINITIONS, {
    context: { command, configInfos },
  })
  const configB = await addPlugins(configA, command)
  return configB
}
