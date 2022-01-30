import { basename } from 'path'

import { isFile } from 'path-type'

import { lookupFiles } from '../lookup.js'
import { DEFAULT_VALUES_BASE } from '../normalize/cwd.js'
import { normalizeConfig } from '../normalize/main.js'
import { normalizeOptionalArray } from '../normalize/transform.js'

import { getConfigFilenames } from './contents.js'
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

// Retrieve the default value for the `config` CLI flag
const getDefaultConfig = async function () {
  const defaultConfigFilenames = getConfigFilenames()
  return await lookupFiles(
    (filePath) => defaultConfigFilenames.includes(basename(filePath)),
    DEFAULT_VALUES_BASE,
  )
}

// Retrieve the `base` used to resolve the `config` property
const getConfigCwd = function (value, { context: { base } }) {
  return base
}

const validate = async function (configPath) {
  if (!(await isFile(configPath))) {
    throw new Error('must be an existing file.')
  }
}

const configProp = {
  name: 'config',
  default: getDefaultConfig,
  transform: normalizeOptionalArray,
}

const configPropAny = {
  name: 'config.*',
  path: isConfigFilePath,
  cwd: getConfigCwd,
  transform: useResolvers,
  validate,
}

const CONFIG_DEFINITIONS = [configProp, configPropAny]
