import { resolve } from 'path'

import findUp from 'find-up'
import { isFile } from 'path-type'

import { UserError } from '../error/main.js'

import { validateConfig } from './validate.js'

// Retrieve `spyd.yml` absolute file path.
// `spyd.yml` is optional, so this can return `undefined`.
export const getConfigPath = async function ({ config: configPath }) {
  if (configPath !== undefined) {
    return await getUserConfigPath(configPath)
  }

  return await getDefaultConfigPath()
}

const getUserConfigPath = async function (configPath) {
  validateConfig({ config: configPath })

  const configPathA = resolve(configPath)

  if (!(await isFile(configPathA))) {
    throw new UserError(`"config" file does not exist: ${configPath}`)
  }

  return configPathA
}

// By default, we find the first `benchmark/spyd.yml`.
const getDefaultConfigPath = async function () {
  return await findUp(DEFAULT_CONFIG)
}

// spyd.yaml is supported but undocumented. spyd.yml is preferred.
const DEFAULT_CONFIG = ['./benchmark/spyd.yml', './benchmark/spyd.yaml']
