import { dirname, extname } from 'path'

import { UserError } from '../error/main.js'
import { importJsDefault } from '../utils/import.js'
import { loadYamlFile } from '../utils/yaml.js'

import { addConfigExtend } from './extend.js'
import { resolveConfigPaths } from './resolve.js'
import { validateConfig } from './validate.js'

// Load CLI programmatic flags
export const getConfigNonFile = async function (configFlags, processCwd) {
  validateConfig(configFlags)
  return await resolveConfigPaths(configFlags, processCwd)
}

// Load `spyd.*` file.
// Any configuration property can be specified in it except `config` itself.
export const getConfigFile = async function (configPath) {
  if (configPath === undefined) {
    return {}
  }

  const configFile = await loadConfigByPath(configPath)

  validateConfig(configFile)
  return await resolveConfigPaths(configFile, dirname(configPath))
}

const loadConfigByPath = async function (configPath) {
  const configContents = await loadConfigContents(configPath)
  const configContentsA = await addConfigExtend(
    configContents,
    configPath,
    loadConfigByPath,
  )
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
