import { loadConfig } from './load/main.js'
import { getPropCwd } from './normalize/cwd.js'
import { normalizeConfig } from './normalize/main.js'
import { RULES } from './normalize/rules.js'
import { normalizePluginsConfig } from './plugin/main.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const { config, configInfos } = await loadConfig(configFlags)
  const context = { command }
  const cwd = getPropCwd.bind(undefined, configInfos)
  const configA = await normalizeConfig(config, RULES, { context, cwd })
  const configB = await normalizePluginsConfig({
    config: configA,
    command,
    context,
    cwd,
  })
  return configB
}
