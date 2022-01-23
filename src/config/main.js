import { UserError } from '../error/main.js'

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
  const configA = await normalizeConfig(config, {
    command,
    configInfos,
    ErrorType: UserError,
  })
  const configB = await addPlugins(configA, command)
  return configB
}
