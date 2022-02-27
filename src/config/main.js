import { loadConfig } from './load/main.js'
import { normalizeConfig } from './normalize/main.js'
import { RULES } from './normalize/rules.js'
import { normalizePluginsConfig } from './plugin/main.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const { config, cwd } = await loadConfig(configFlags)
  const context = { command }
  const configA = await normalizeConfig(config, RULES, { context, cwd })
  const configB = await normalizePluginsConfig({
    config: configA,
    command,
    context,
    cwd,
  })
  return configB
}
