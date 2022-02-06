import { loadConfig } from './load/main.js'
import { DEFINITIONS } from './normalize/definitions.js'
import { normalizeVariableConfig } from './normalize/main.js'
import { addPlugins } from './plugin/add.js'

// Retrieve configuration
export const getConfig = async function (
  command,
  { config: configOpt, ...configFlags } = {},
) {
  const { config, configInfos } = await loadConfig(configOpt, configFlags)
  const context = { command, configInfos }
  const configA = await normalizeVariableConfig(config, DEFINITIONS, {
    context,
  })
  const configB = await addPlugins(configA, command, context)
  return configB
}
