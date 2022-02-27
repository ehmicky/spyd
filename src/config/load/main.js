import { removeEmptyValues } from '../empty.js'
import { deepMerge } from '../merge.js'
import { CLI_FLAGS_BASE, getDefaultBase, getPropCwd } from '../normalize/cwd.js'

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
  const config = deepMerge(configInfos.map(getConfigContents))
  const configA = removeEmptyValues(config)
  const bases = deepMerge(configInfos.map(getBases))
  const defaultBase = getDefaultBase(configInfos)
  const cwd = getPropCwd.bind(undefined, { bases, defaultBase })
  return { config: configA, cwd }
}

const getConfigContents = function ({ configContents }) {
  return configContents
}

const getBases = function ({ bases }) {
  return bases
}
