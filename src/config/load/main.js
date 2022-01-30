import { mergeConfigs } from '../merge/main.js'
import { CLI_FLAGS_BASE } from '../normalize/cwd.js'

import { getConfigsInfos } from './info.js'
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
export const loadConfig = async function (configOpt, configFlags) {
  const configOptA = addNpxShortcut(configOpt)
  const configInfos = await getConfigsInfos(configOptA, CLI_FLAGS_BASE)
  const configInfosA = [
    ...configInfos,
    { configContents: configFlags, base: CLI_FLAGS_BASE },
  ]
  const configsB = configInfosA.map(getConfigContents)
  const configB = mergeConfigs(configsB)
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosB = [...configInfosA].reverse()
  return { config: configB, configInfos: configInfosB }
}

const getConfigContents = function ({ configContents }) {
  return configContents
}
