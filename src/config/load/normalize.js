import { normalizeConfig } from '../normalize/main.js'
import { normalizeArray } from '../normalize/transform.js'

import { getDefaultConfig } from './default.js'
import { normalizeConfigFilePath, resolveConfig } from './resolve.js'

// The `config` property is normalized and validated before all other properties
export const normalizeConfigProp = async function (configOpt, base) {
  const { config: configPaths } = await normalizeConfig(
    { config: configOpt },
    CONFIG_RULES,
    { cwd: base },
  )
  return configPaths
}

const configProp = {
  name: 'config',
  default: getDefaultConfig,
  transform: normalizeArray,
}

const configPropAny = [
  {
    name: 'config.*',
    path: normalizeConfigFilePath,
    transform: resolveConfig,
  },
]

export const CONFIG_RULES = [configProp, ...configPropAny]
