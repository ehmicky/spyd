import { removeEmptyValues } from './empty.js'
import { loadConfigFile } from './file.js'
import { mergeConfigs } from './merge.js'
import { setConfigAbsolutePaths } from './path.js'
import { validateConfig } from './validate.js'

// Load the configuration, shallow merged in priority order:
//  - any CLI or programmatic flags
//  - `spyd.*`
// We do not allow configuring using environment variables because they:
//  - are not very useful
//  - add too many constraints related to naming configuration properties:
//    case-sensitiveness (due to Windows) and fewer allowed delimiters (due
//    to underscores only being allowed in Unix)
// We purposely remove the `config` property during this step.
export const loadConfig = async function ({ config, ...configFlags }) {
  const configInfos = await loadConfigFile(config)
  const configInfosA = [
    ...configInfos,
    { configContents: configFlags, base: '.' },
  ]
  const configs = configInfosA.map(getConfigContents)
  const configA = mergeConfigs(configs)
  const configB = removeEmptyValues(configA)
  validateConfig(configB)
  const configC = setConfigAbsolutePaths(configB, configInfosA)
  return configC
}

const getConfigContents = function ({ configContents }) {
  return configContents
}
