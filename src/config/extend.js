import { resolve, dirname } from 'path'

import { isFile } from 'path-type'

import { UserError } from '../error/main.js'

import { mergeConfigs } from './merge.js'
import { validateConfig } from './validate.js'

// Configuration files can use shared configuration using the `extend` property.
// This points to a Node module or a local file path.
// This enables repository-wide, machine-wide or organization-wide configuration
export const addConfigExtend = async function (
  { extend, ...configContents },
  configPath,
  loadConfigByPath,
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
