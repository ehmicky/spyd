import { loadConfig } from './load/main.js'
import { getPropCwd } from './normalize/cwd.js'
import { DEFINITIONS } from './normalize/definitions.js'
import { normalizeConfig } from './normalize/main.js'
import { normalizePluginsConfig } from './plugin/main.js'

// Retrieve configuration
export const getConfig = async function (
  command,
  { config: configOpt, ...configFlags } = {},
) {
  const { config, configInfos } = await loadConfig(configOpt, configFlags)
  const context = { command }
  const cwd = getPropCwd.bind(undefined, configInfos)
  const configA = await normalizeConfig(config, DEFINITIONS, { context, cwd })
  const configB = await normalizePluginsConfig({
    config: configA,
    command,
    context,
    cwd,
  })
  return configB
}
