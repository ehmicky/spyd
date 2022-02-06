import { loadConfig } from './load/main.js'
import { DEFINITIONS } from './normalize/definitions.js'
import { normalizeUserConfig } from './normalize/main.js'
import { normalizePluginsConfig } from './plugin/main.js'

// Retrieve configuration
export const getConfig = async function (
  command,
  { config: configOpt, ...configFlags } = {},
) {
  const { config, configInfos } = await loadConfig(configOpt, configFlags)
  const context = { command }
  const configA = await normalizeUserConfig({
    config,
    definitions: DEFINITIONS,
    opts: { context },
    configInfos,
  })
  const configB = await normalizePluginsConfig({
    config: configA,
    command,
    context,
    configInfos,
  })
  return configB
}
