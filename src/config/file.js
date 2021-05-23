import { dirname } from 'path'

import isPlainObj from 'is-plain-obj'

import { UserError } from '../error/main.js'

import { loadConfigContents } from './contents.js'
import { resolveConfigPath } from './resolve.js'

// Load `spyd.*` and any child configuration files.
// `spyd.*` is optional, so this can return an empty array. This allows
// benchmarking on-the-fly in a terminal without having to create a
// configuration file.
export const loadConfigFile = async function ({ config = 'default' }) {
  return await getConfigsInfos(config, '.')
}

// Load `spyd.*` file.
// Configuration files can use shared configuration using the `config` property
// inside another configure file.
// This points to a Node module or a local file path.
// This enables repository-wide, machine-wide or organization-wide configuration
const getConfigsInfos = async function (config, base) {
  const configs = normalizeConfigProp(config)
  const configInfos = await Promise.all(
    configs.map((configA) => getConfigInfos(configA, base)),
  )
  return configInfos.flat()
}

// The `config` property can optionally be an array.
// The "default" resolver:
//  - Is the default of the top-level `config` CLI flags but not inside
//    configuration files
//  - Can be specified explicitely by users. This can be useful when overridding
//    a `config` property inherited from a child configuration.
const normalizeConfigProp = function (config) {
  const configs = Array.isArray(config) ? config : [config]
  configs.forEach((configA) => {
    validateConfigString(configA)
  })
  return configs
}

const validateConfigString = function (value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new UserError(
      `The "config" property must be a non-empty string: ${value}`,
    )
  }
}

const getConfigInfos = async function (config, base) {
  const configPath = await resolveConfigPath(config, base)

  if (configPath === undefined) {
    return []
  }

  const configContents = await loadConfigContents(configPath)

  if (!isPlainObj(configContents)) {
    throw new UserError(
      `The configuration file must be an object: ${configPath}`,
    )
  }

  const configInfo = { configContents, base }

  if (configContents.config === undefined) {
    return configInfo
  }

  const childConfigInfos = getConfigsInfos(config, dirname(configPath))
  return [...childConfigInfos, configInfo]
}
