import { normalizeConfig } from '../normalize/main.js'
import { normalizeArray } from '../normalize/transform.js'
import {
  validateFileExists,
  validateRegularFile,
} from '../normalize/validate/fs.js'

import { getDefaultConfig } from './default.js'
import { isConfigFilePath, resolveConfig } from './resolve.js'

// The `config` property is normalized and validated before all other properties
export const normalizeConfigProp = async function (
  configOpt,
  base,
  childConfigPaths,
) {
  const prefix = childConfigPaths.length === 0 ? CLI_FLAGS_PREFIX : undefined
  const { config: configPaths } = await normalizeConfig(
    { config: configOpt },
    CONFIG_RULES,
    { cwd: base, prefix },
  )
  return configPaths
}

const CLI_FLAGS_PREFIX = 'CLI flag'

const configProp = {
  name: 'config',
  default: getDefaultConfig,
  transform: normalizeArray,
}

const configPropAny = [
  {
    name: 'config.*',
    path: isConfigFilePath,
    transform: resolveConfig,
  },
  {
    name: 'config.*',
    validate: [validateFileExists, validateRegularFile],
  },
]

export const CONFIG_RULES = [configProp, ...configPropAny]
