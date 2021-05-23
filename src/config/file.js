import { dirname } from 'path'

import isPlainObj from 'is-plain-obj'

import { UserError } from '../error/main.js'

import { loadConfigContents } from './contents.js'
import {
  normalizeTopConfigProp,
  normalizeConfigProp,
  normalizeCwdProp,
} from './normalize_prop.js'
import { resolveConfigPath } from './resolve.js'

// Load `spyd.*` and any child configuration files.
// `spyd.*` is optional, so this can return an empty array. This allows
// benchmarking on-the-fly in a terminal without having to create a
// configuration file.
export const loadConfigFile = async function ({ config, cwd }) {
  const configs = normalizeTopConfigProp(config)
  const base = normalizeCwdProp(cwd)
  return await getConfigsInfos(configs, base)
}

// Load `spyd.*` file.
// Configuration files can use shared configuration using the `config` property
// inside another configure file.
// This points to a Node module or a local file path.
// This enables repository-wide, machine-wide or organization-wide configuration
const getConfigsInfos = async function (configs, base) {
  const configInfos = await Promise.all(
    configs.map((config) => getConfigInfos(config, base)),
  )
  return configInfos.flat()
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

  const childConfigInfos = getChildConfigInfos(configContents)
  return [...childConfigInfos, { configContents, base }]
}

const getChildConfigInfos = function ({ config }, configPath) {
  const childConfigs = normalizeConfigProp(config)
  return childConfigs === undefined
    ? []
    : getConfigsInfos(childConfigs, dirname(configPath))
}
