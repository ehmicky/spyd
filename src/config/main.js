import { loadConfig } from './load/main.js'
import { DEFINITIONS } from './normalize/definitions.js'
import { normalizeUserConfig } from './normalize/main.js'
import { addPlugins } from './plugin/lib/add.js'

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
  const configB = await addPlugins({
    config: configA,
    command,
    context,
    configInfos,
  })
  return configB
}
