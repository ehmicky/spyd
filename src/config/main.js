import { loadConfig } from './load/main.js'
import { normalizeConfig } from './normalize.js'
import { addPlugins } from './plugin/add.js'

// Retrieve configuration
export const getConfig = async function (
  command,
  { config: configOpt, ...configFlags } = {},
) {
  const { config: configOpts } = await normalizeConfig(
    { config: configOpt },
    command,
    [],
  )
  const { config: configA, configInfos } = await loadConfig(
    configOpts,
    configFlags,
  )
  const configB = await normalizeConfig(configA, command, configInfos)
  const configC = await addPlugins(configB, command)
  return configC
}
