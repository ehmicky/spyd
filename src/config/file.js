import { resolve, dirname, extname } from 'path'

import { isFile } from 'path-type'

import { UserError } from '../error/main.js'
import { importJsDefault } from '../utils/import.js'
import { loadYamlFile } from '../utils/yaml.js'

import { mergeConfigs } from './merge.js'
import { validateConfig } from './validate.js'

// Load config YAML file
export const loadConfigFile = async function (configPath) {
  if (configPath === undefined) {
    return {}
  }

  const configContents = await loadConfigContents(configPath)
  const configContentsA = await addConfigExtend(configContents, configPath)
  return configContentsA
}

const loadConfigContents = async function (configPath) {
  const loadFunc = EXTENSIONS[extname(configPath)]

  if (loadFunc === undefined) {
    throw new UserError(
      `The configuration file format is not supported: ${configPath}
Please use .yml, .js, .cjs or .ts`,
    )
  }

  try {
    return await loadFunc(configPath)
  } catch (error) {
    throw new UserError(
      `Could not load configuration file '${configPath}': ${error.message}`,
    )
  }
}

const EXTENSIONS = {
  '.yml': loadYamlFile,
  '.yaml': loadYamlFile,
  '.js': importJsDefault,
  '.cjs': importJsDefault,
  '.ts': importJsDefault,
}

// Configuration files can use shared configuration using the `extend` property.
// This points to a Node module or a local file path.
// This enables repository-wide, machine-wide or organization-wide configuration
export const addConfigExtend = async function (
  { extend, ...configContents },
  configPath,
) {
  if (extend === undefined) {
    return configContents
  }

  validateConfig({ extend })

  const absoluteExtend = resolve(dirname(configPath), extend)

  if (!(await isFile(absoluteExtend))) {
    throw new UserError(
      `Extended configuration file does not exist: '${absoluteExtend}'`,
    )
  }

  const extendedConfig = await loadConfigFile(absoluteExtend)
  return mergeConfigs(extendedConfig, configContents)
}
