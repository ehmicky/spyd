import findUp from 'find-up'
import { isFile } from 'path-type'

import { UserError } from '../error/main.js'

// Retrieve `spyd.*` absolute file path.
// `spyd.*` is optional, so this can return `undefined`. This allows
// benchmarking on-the-fly in a terminal without having to create a
// configuration file.
export const getConfigPath = async function (
  processCwd,
  { config: configPath, cwd = processCwd },
) {
  if (configPath !== undefined) {
    return await getUserConfigPath(configPath)
  }

  return await getDefaultConfigPath(cwd)
}

const getUserConfigPath = async function (configPath) {
  if (!(await isFile(configPath))) {
    throw new UserError(`"config" file does not exist: ${configPath}`)
  }

  return configPath
}

// By default, we find the first `benchmark/spyd.*`.
const getDefaultConfigPath = async function (cwd) {
  return await findUp(DEFAULT_CONFIG, { cwd })
}

// spyd.yaml is supported but undocumented. spyd.yml is preferred.
const DEFAULT_CONFIG = [
  './benchmark/spyd.js',
  './benchmark/spyd.cjs',
  './benchmark/spyd.ts',
  './benchmark/spyd.yml',
  './benchmark/spyd.yaml',
]
