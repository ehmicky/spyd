import { removeEmptyValues } from './empty.js'
import { loadConfigFile } from './file.js'
import { mergeConfigs } from './merge.js'
import { getConfigPath } from './path.js'
import { resolveConfigPaths } from './resolve.js'

// Load the configuration, shallow merged in priority order:
//  - any CLI or programmatic flags
//  - `spyd.*`
// We make sure the `config` property from `spyd.*` is ignored.
// We do not allow configuring using environment variables because they:
//  - are not very useful
//  - add too many constraints related to naming configuration properties:
//    case-sensitiveness (due to Windows) and fewer allowed delimiters (due
//    to underscores only being allowed in Unix)
export const loadConfig = async function (configFlags, cwd) {
  const configNonFile = await resolveConfigPaths(configFlags, cwd)

  const configPath = await getConfigPath(configNonFile, cwd)
  const configFile = await loadConfigFile(configPath)
  const configA = mergeConfigs(configFile, configNonFile)
  const configB = { ...configA, config: configPath }

  const configC = removeEmptyValues(configB)
  return configC
}
