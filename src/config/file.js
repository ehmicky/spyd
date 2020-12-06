import { resolve } from 'path'
import { cwd as getCwd } from 'process'

import findUp from 'find-up'

import { UserError } from '../error/main.js'
import { loadYamlFile } from '../utils/yaml.js'

// Retrieve the content of the configuration file (if any)
export const getConfigFile = async function ({ configPath, cwd, config }) {
  const configPathA = await findConfigPath(configPath, cwd)

  if (configPathA === undefined) {
    return config
  }

  const configContent = await getConfigContent(configPathA)
  return { ...configContent, ...config }
}

const findConfigPath = function (configPath, cwd = getCwd()) {
  if (configPath !== undefined) {
    return resolve(cwd, configPath)
  }

  return findUp(DEFAULT_CONFIG, { cwd })
}

// spyd.yaml is supported but undocumented. spyd.yml is preferred.
const DEFAULT_CONFIG = ['spyd.yml', 'spyd.yaml']

const getConfigContent = async function (configPath) {
  try {
    return await loadYamlFile(configPath)
  } catch (error) {
    throw new UserError(
      `Could not load configuration file '${configPath}': ${error.message}`,
    )
  }
}
