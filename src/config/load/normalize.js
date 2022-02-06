import { normalizeConfig } from '../normalize/main.js'
import { normalizeOptionalArray } from '../normalize/transform.js'
import {
  validateFileExists,
  validateRegularFile,
} from '../normalize/validate/fs.js'

import { getDefaultConfig } from './default.js'
import { isConfigFilePath, useResolvers } from './resolvers.js'

// The `config` property is normalized and validated before all other properties
export const normalizeConfigProp = async function (configOpt, base) {
  const { config: configPaths } = await normalizeConfig(
    { config: configOpt },
    CONFIG_DEFINITIONS,
    { cwd: base },
  )
  return configPaths
}

const configProp = {
  name: 'config',
  default: getDefaultConfig,
  transform: normalizeOptionalArray,
}

const validateConfig = async function (value) {
  await validateFileExists(value)
  await validateRegularFile(value)
}

const configPropAny = [
  {
    name: 'config.*',
    path: isConfigFilePath,
    transform: useResolvers,
  },
  {
    name: 'config.*',
    validate: validateConfig,
  },
]

export const CONFIG_DEFINITIONS = [configProp, ...configPropAny]
