import { removeEmptyValues } from './empty.js'
import { getEnvVarConfig } from './env.js'
import { loadConfigFile } from './file.js'
import { mergeConfigs } from './merge.js'
import { getConfigPath } from './path.js'

// Load the configuration, shallow merged in priority order:
//  - any CLI or programmatic flags
//  - any `SPYD_*` environment variables
//  - `spyd.yml`
// We make sure the `config` property from `spyd.yml` is ignored.
export const loadConfig = async function (configFlags) {
  const envVarConfig = getEnvVarConfig()
  const config = { ...envVarConfig, ...configFlags }

  const configPath = await getConfigPath(config)
  const configFile = await loadConfigFile(configPath)
  const configA = mergeConfigs(configFile, config)
  const configB = { ...configA, config: configPath }

  const configC = removeEmptyValues(configB)
  return configC
}
