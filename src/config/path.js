import { resolve } from 'path'

import findUp from 'find-up'
import { isFile } from 'path-type'

import { UserError } from '../error/main.js'

import { validateConfig } from './validate.js'

// Retrieve `spyd.*` absolute file path.
// `spyd.*` is optional, so this can return `undefined`.
export const getConfigPath = async function ({ config: configPath }, cwd) {
  if (configPath !== undefined) {
    return await getUserConfigPath(configPath, cwd)
  }

  return await getDefaultConfigPath(cwd)
}

const getUserConfigPath = async function (configPath, cwd) {
  validateConfig({ config: configPath })

  const configPathA = resolve(cwd, configPath)

  if (!(await isFile(configPathA))) {
    throw new UserError(`"config" file does not exist: ${configPath}`)
  }

  return configPathA
}

// By default, we find the first `benchmark/spyd.*`.
const getDefaultConfigPath = async function (cwd) {
  const configPath = await findUp(DEFAULT_CONFIG, { cwd })

  if (configPath === undefined) {
    throw new UserError(`No configuration file was found. Please either:
  - create ./benchmark/spyd.{yml,js,cjs,ts} in the repository root directory.
  - create spyd.{yml,js,cjs,ts} somewhere else then specify its location using the --config flag.`)
  }

  return configPath
}

// spyd.yaml is supported but undocumented. spyd.yml is preferred.
const DEFAULT_CONFIG = [
  './benchmark/spyd.js',
  './benchmark/spyd.cjs',
  './benchmark/spyd.ts',
  './benchmark/spyd.yml',
  './benchmark/spyd.yaml',
]
