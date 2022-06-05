import { normalizeConfig } from '../normalize/main.js'
import { normalizeArray } from '../normalize/transform.js'

import { getDefaultConfig } from './default.js'
import { normalizeConfigFilePath, resolveConfig } from './resolve.js'

// The `config` property is normalized and validated before all other properties
export const normalizeConfigProp = async function (configOpt, base) {
  const { config: configPaths } = await normalizeConfig(
    { config: configOpt },
    CONFIG_RULES,
    { all: { cwd: base } },
  )
  return configPaths
}

export const CONFIG_RULES = [
  {
    name: 'config',
    default: getDefaultConfig,
    transform: normalizeArray,
  },
  {
    name: 'config.*',
    required: true,
    path: normalizeConfigFilePath,
    transform: resolveConfig,
  },
]
