import envPaths from 'env-paths'
import findUp from 'find-up'
import locatePath from 'locate-path'

import { UserError } from '../error/main.js'
import { loadYamlFile } from '../utils/yaml.js'

// Load the configuration, shallow merged in priority order:
//  - any CLI or programmatic flags
//  - any `SPYD_*` environment variables
//  - `spyd.yml` in the settings directory or any parent directory
//  - `spyd.yml` in the current directory or any parent directory
//  - `spyd.yml` in the global configuration directory which is usually:
//      - Linux: /home/{user}/.config/spyd/spyd.yml
//      - macOS: /Users/{user}/Library/Preferences/spyd/spyd.yml
//      - Windows: C:\Users\{user}\AppData\Roaming\spyd\Config\spyd.yml
export const loadConfig = async function (settings, configFlags) {
  const [settingsConfig, cwdConfig, globalConfig] = await Promise.all(
    [
      getSettingsConfigPath(settings),
      getCwdConfigPath(),
      getGlobalConfigPath(),
    ].map(getConfigContent),
  )
  return {
    ...globalConfig,
    ...cwdConfig,
    ...settingsConfig,
    ...configFlags,
  }
}

const getSettingsConfigPath = async function (settings) {
  return await findUp(CONFIG_FILENAMES, { cwd: settings })
}

const getCwdConfigPath = async function () {
  return await findUp(CONFIG_FILENAMES)
}

const getGlobalConfigPath = async function () {
  const { config: globalConfigDir } = envPaths(GLOBAL_CONFIG_NAME)
  const globalConfigPaths = CONFIG_FILENAMES.map(
    (filename) => `${globalConfigDir}/${filename}`,
  )
  return await locatePath(globalConfigPaths)
}

// spyd.yaml is supported but undocumented. spyd.yml is preferred.
const CONFIG_FILENAMES = ['spyd.yml', 'spyd.yaml']
const GLOBAL_CONFIG_NAME = 'spyd'

const getConfigContent = async function (configPathPromise) {
  const configPath = await configPathPromise

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
