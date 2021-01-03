import { removeEmptyValues } from './empty.js'
import { getEnvVarConfig } from './env.js'
import { loadConfigFile } from './file.js'
import { mergeConfigs } from './merge.js'
import { getConfigPath } from './path.js'
import { getCwd, resolveConfigPaths } from './resolve.js'

// Load the configuration, shallow merged in priority order:
//  - any CLI or programmatic flags
//  - any `SPYD_*` environment variables
//  - `spyd.*`
// We make sure the `config` property from `spyd.*` is ignored.
export const loadConfig = async function (configFlags) {
  const configNonFile = loadConfigNonFile(configFlags)

  const configPath = await getConfigPath(configNonFile)
  const cwd = getCwd(configPath)
  const configFile = await loadConfigFile(configPath, cwd)
  const configA = mergeConfigs(configFile, configNonFile)
  const configB = { ...configA, config: configPath }

  const configC = removeEmptyValues(configB)
  return { config: configC, cwd }
}

// Load configuration not in `spyd.*`
const loadConfigNonFile = function (configFlags) {
  const envVarConfig = getEnvVarConfig()
  const configNonFile = { ...envVarConfig, ...configFlags }
  const configNonFileA = resolveConfigPaths(configNonFile, '.')
  return configNonFileA
}
