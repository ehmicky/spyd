import { removeEmptyValues } from '../empty.js'
import { deepMerge } from '../merge.js'
import { CLI_FLAGS_BASE } from '../normalize/cwd.js'

import { getConfigInfos } from './info.js'
import { addNpxShortcut } from './npx.js'

// Load the configuration, shallow merged in priority order:
//  - any CLI or programmatic flags
//  - `spyd.*`
// We do not allow configuring using environment variables because they:
//  - are not very useful
//  - add too many constraints related to naming configuration properties:
//    case-sensitiveness (due to Windows) and fewer allowed delimiters (due
//    to underscores only being allowed in Unix)
// We purposely remove the `config` property during this step.
export const loadConfig = async function (configFlags) {
  const configFlagsA = addNpxShortcut(configFlags)
  const configInfos = await getConfigInfos(configFlagsA, CLI_FLAGS_BASE)
  const configs = configInfos.map(getConfigContents)
  const config = deepMerge(configs)
  const configA = removeEmptyValues(config)
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return { config: configA, configInfos: configInfosA }
}

const getConfigContents = function ({ configContents }) {
  return configContents
}
