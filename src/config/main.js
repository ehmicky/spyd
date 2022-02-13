import { removeEmptyValues } from './empty.js'
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
  const configA = removeEmptyValues(config)
  const context = { command }
  const cwd = getPropCwd.bind(undefined, configInfos)
  const configB = await normalizeConfig(configA, DEFINITIONS, { context, cwd })
  const configC = await normalizePluginsConfig({
    config: configB,
    command,
    context,
    cwd,
  })
  return configC
}
