import { dirname, extname } from 'path'

import isPlainObj from 'is-plain-obj'

import { UserError } from '../error/main.js'
import { importJsDefault } from '../utils/import.js'
import { loadYamlFile } from '../utils/yaml.js'

import { normalizeTopConfigProp, normalizeCwdProp } from './normalize_prop.js'
import { resolveConfigPath } from './resolve.js'

// Load `spyd.*` and any child configuration files.
// `spyd.*` is optional, so this can return an empty array. This allows
// benchmarking on-the-fly in a terminal without having to create a
// configuration file.
export const loadConfigFile = async function ({ config, cwd }) {
  const configs = normalizeTopConfigProp(config)
  const cwdA = normalizeCwdProp(cwd)
  return await getConfigsInfos(configs, cwdA)
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

  const configInfo = { configContents, base }
  const childConfig = normalizeConfigProp(configContents.config)

  if (childConfig === undefined) {
    return [configInfo]
  }

  const childBase = dirname(configPath)
  const childConfigInfos = getConfigsInfos(childConfigs, childBase)
  return [...childConfigInfos, configInfo]
}

const loadConfigContents = async function (config) {
  const loadFunc = EXTENSIONS[extname(config)]

  if (loadFunc === undefined) {
    throw new UserError(
      `The configuration file format is not supported: ${config}
Please use .yml, .js, .cjs or .ts`,
    )
  }

  try {
    return await loadFunc(config)
  } catch (error) {
    throw new UserError(
      `Could not load configuration file '${config}': ${error.message}`,
    )
  }
}

// spyd.yaml is supported but undocumented. spyd.yml is preferred.
const EXTENSIONS = {
  '.yml': loadYamlFile,
  '.yaml': loadYamlFile,
  '.js': importJsDefault,
  '.cjs': importJsDefault,
  '.ts': importJsDefault,
}
