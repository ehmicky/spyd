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
    { context: { base } },
  )
  return configPaths
}

const configProp = {
  name: 'config',
  default: getDefaultConfig,
  transform: normalizeOptionalArray,
}

// Retrieve the `base` used to resolve the `config` property
const getConfigCwd = function (value, { context: { base } }) {
  return base
}

const transformConfig = async function (value) {
  const valueA = await useResolvers(value)
  await validateFileExists(valueA)
  await validateRegularFile(valueA)
  return valueA
}

const configPropAny = {
  name: 'config.*',
  path: isConfigFilePath,
  cwd: getConfigCwd,
  transform: transformConfig,
}

export const CONFIG_DEFINITIONS = [configProp, configPropAny]
