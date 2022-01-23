import { loadConfig } from './load/main.js'
import { normalizeConfig } from './normalize/main.js'
import { addPlugins } from './plugin/add.js'

// Retrieve configuration
export const getConfig = async function (
  command,
  { config: configOpt, ...configFlags } = {},
) {
  const { config, configInfos } = await loadConfig(
    configOpt,
    configFlags,
    command,
  )
  const configa = await normalizeConfig(config, command, configInfos)
  const configB = await addPlugins(configa, command)
  return configB
}
