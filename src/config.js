import { cwd as getCwd } from 'process'
import { resolve } from 'path'
import { readFile } from 'fs'
import { promisify } from 'util'

import findUp from 'find-up'

const pReadFile = promisify(readFile)

export const handleConfig = async function({ config, ...opts }) {
  const { cwd = getCwd() } = opts

  const configFile = await getConfigFile(config, cwd)

  if (configFile === undefined) {
    return opts
  }

  const configContent = await getConfigContent(configFile, cwd)
  const configOpts = parseConfig(configContent, configFile)
  return { ...configOpts, ...opts }
}

const getConfigFile = async function(config, cwd) {
  if (config !== undefined) {
    return config
  }

  const configFile = await findUp(DEFAULT_CONFIG_FILE, { cwd })
  return configFile
}

// The dash version is only allowed for typos, not documented
const DEFAULT_CONFIG_FILE = ['check_speed.json', 'check-speed.json']

const getConfigContent = async function(configFile, cwd) {
  const configPath = resolve(cwd, configFile)

  try {
    return await pReadFile(configPath, 'utf-8')
  } catch (error) {
    throw new Error(
      `Could not load config file '${configFile}': ${error.message}`,
    )
  }
}

const parseConfig = function(configContent, configFile) {
  try {
    return JSON.parse(configContent)
  } catch (error) {
    throw new Error(
      `Could not parse config file '${configFile}: ${error.message}`,
    )
  }
}
