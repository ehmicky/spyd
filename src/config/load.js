import { UserError } from '../error/main.js'
import { loadYamlFile } from '../utils/yaml.js'

import { getEnvVarConfig } from './env.js'
import { getConfigPath } from './path.js'

// Load the configuration, shallow merged in priority order:
//  - any CLI or programmatic flags
//  - any `SPYD_*` environment variables
//  - `spyd.yml`
export const loadConfig = async function (configFlags) {
  const envVarConfig = getEnvVarConfig()
  const config = { ...envVarConfig, ...configFlags }
  const configPath = await getConfigPath(config)
  const configFile = await loadConfigFile(configPath)
  const configA = { ...configFile, ...config }
  return { ...configA, config: configPath }
}

const loadConfigFile = async function (configPath) {
  if (configPath === undefined) {
    return {}
  }

  try {
    return await loadYamlFile(configPath)
  } catch (error) {
    throw new UserError(
      `Could not load configuration file '${configPath}': ${error.message}`,
    )
  }
}
