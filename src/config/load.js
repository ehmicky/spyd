import omit from 'omit.js'

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
export const loadConfig = async function (configFlags) {
  const configInfos = await loadConfigFile(configFlags)
  const configInfosA = [
    ...configInfos,
    { configContents: configFlags, base: '.' },
  ]
  const configs = configInfosA.map(setConfigAbsolutePaths)
  const config = mergeConfigs(configs)
  const configA = removeEmptyValues(config)
  const configB = omit(configA, 'config')
  validateConfig(configB)
  return configB
}
