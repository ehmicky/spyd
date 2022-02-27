import { removeEmptyValues } from '../empty.js'

import {
  CLI_FLAGS_BASE,
  getDefaultBase,
  getPropCwd,
  removeBases,
} from './cwd.js'
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
  const { configWithBases, bases } = await getConfigInfos(
    configFlagsA,
    CLI_FLAGS_BASE,
  )
  const defaultBase = getDefaultBase(bases)
  const cwd = getPropCwd.bind(undefined, { configWithBases, defaultBase })
  const config = removeBases(configWithBases)
  const configA = removeEmptyValues(config)
  return { config: configA, cwd }
}
