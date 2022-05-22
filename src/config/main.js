import {
  CLI_FLAGS_BASE,
  getDefaultBase,
  getPropCwd,
  removeBases,
} from './cwd.js'
import { loadConfig } from './load/main.js'
import { normalizeConfig } from './normalize/main.js'
import { RULES } from './normalize/rules.js'
import { addNpxShortcut } from './npx.js'
import { normalizePluginsConfig } from './plugin/main.js'
import { removeUndefined } from './undefined.js'

// Retrieve configuration
export const getConfig = async function (command, configFlags = {}) {
  const { config, cwd } = await resolveConfig(configFlags)
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

// Load the configuration, deeply merged in priority order:
//  - any CLI or programmatic flags
//  - `spyd.*`
// We do not allow configuring using environment variables because they:
//  - are not very useful
//  - add too many constraints related to naming configuration properties:
//    case-sensitiveness (due to Windows) and fewer allowed delimiters (due
//    to underscores only being allowed in Unix)
// We purposely remove the `config` property during this step.
const resolveConfig = async function (configFlags) {
  const configFlagsA = addNpxShortcut(configFlags)
  const { configWithBases, bases } = await loadConfig(
    configFlagsA,
    CLI_FLAGS_BASE,
    [],
  )
  const defaultBase = getDefaultBase(bases)
  const cwd = getPropCwd.bind(undefined, { configWithBases, defaultBase })
  const config = removeBases(configWithBases)
  const configA = removeUndefined(config)
  return { config: configA, cwd }
}
