import { resolve } from 'path'
import { cwd as getCwd } from 'process'

import findUp from 'find-up'

import { UserError } from '../error/main.js'
import { loadYamlFile } from '../utils/yaml.js'

// Retrieve options from the configuration file (if any)
export const getConfig = async function ({ config, cwd, opts }) {
  const configPath = await getConfigPath(config, cwd)

  if (configPath === undefined) {
    return opts
  }

  const configContent = await getConfigContent(configPath)
  return { ...configContent, ...opts }
}

const getConfigPath = async function (config, cwd = getCwd()) {
  if (config !== undefined) {
    return resolve(cwd, config)
  }

  const configFile = await findUp(DEFAULT_CONFIG, { cwd })
  return configFile
}

const DEFAULT_CONFIG = 'spyd.yml'

const getConfigContent = async function (configPath) {
  try {
    return await loadYamlFile(configPath)
  } catch (error) {
    throw new UserError(
      `Could not load configuration file '${configPath}': ${error.message}`,
    )
  }
}
