import { resolve, dirname, extname } from 'path'

import { isFile } from 'path-type'

import { UserError } from '../error/main.js'
import { importJsDefault } from '../utils/import.js'
import { loadYamlFile } from '../utils/yaml.js'

import { mergeConfigs } from './merge.js'
import { resolveConfigPaths } from './resolve.js'
import { validateConfig } from './validate.js'

// Load `spyd.*` file
export const loadConfigFile = async function (configPath) {
  if (configPath === undefined) {
    return {}
  }

  const configFile = await loadConfigByPath(configPath)
  return configFile
}

const loadConfigByPath = async function (configPath) {
  const configContents = await loadConfigContents(configPath)
  const configContentsA = resolveConfigPaths(
    configContents,
    dirname(configPath),
  )
  const configContentsB = await addConfigExtend(configContentsA, configPath)
  return configContentsB
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

  const extendPath = getExtendPath(extend, configPath)

  if (!(await isFile(extendPath))) {
    throw new UserError(
      `Extended configuration file does not exist: '${extendPath}'`,
    )
  }

  const extendedConfig = await loadConfigByPath(extendPath)
  return mergeConfigs(extendedConfig, configContents)
}

const getExtendPath = function (extend, configPath) {
  const baseDir = dirname(configPath)

  if (isFilePath(extend)) {
    return resolve(baseDir, extend)
  }

  try {
    return require.resolve(extend, { paths: [baseDir] })
  } catch (error) {
    throw new Error(`Cannot find extended configuration: ${extend}
If the extended configuration is a Node module, please ensure it is installed.
If it is a local file instead, the path should start with either . or /

${error.stack}`)
  }
}

// We do not allow Windows file paths
const isFilePath = function (extend) {
  return extend.startsWith('/') || extend.startsWith('.')
}
