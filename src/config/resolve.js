import findUp from 'find-up'
import { isFile } from 'path-type'

import { UserError } from '../error/main.js'
import { getPluginPath } from '../plugin/load.js'
import { CONFIG_PLUGIN_TYPE } from '../plugin/types.js'

import { resolvePath } from './path.js'

export const resolveConfigPath = async function (config, base) {
  if (config === DEFAULT_RESOLVER) {
    return await resolveDefault(base)
  }

  const result = RESOLVER_REGEXP.exec(config)

  if (result === null) {
    return await resolveFile(config, base)
  }

  const [, resolverName, resolverArg] = result
  const resolverFunc = RESOLVERS[resolverName]

  if (resolverFunc === undefined) {
    throw new UserError(`Resolver "${resolverName}" does not exist: ${config}`)
  }

  return await resolverFunc(resolverArg, base)
}

// By default, we find the first `spyd.*` or `benchmark/spyd.*` in the current
// or any parent directory.
// A `benchmark` directory is useful for grouping benchmark-related files.
// Not using one is useful for on-the-fly benchmarking, or for global/shared
// configuration.
const resolveDefault = async function (base) {
  return await findUp(DEFAULT_CONFIG, { cwd: base })
}

const DEFAULT_CONFIG = [
  './benchmark/spyd.js',
  './benchmark/spyd.cjs',
  './benchmark/spyd.ts',
  './benchmark/spyd.yml',
  './benchmark/spyd.yaml',
  './spyd.js',
  './spyd.cjs',
  './spyd.ts',
  './spyd.yml',
  './spyd.yaml',
]

export const DEFAULT_RESOLVER = 'default'

const RESOLVER_REGEXP = /^([a-z]+):(.*)$/u

const resolveFile = async function (config, base) {
  if (!(await isFile(config))) {
    throw new UserError(`"config" file does not exist: '${config}'`)
  }

  return resolvePath(config, base)
}

const resolveNpm = function (id, base) {
  return getPluginPath({ ...CONFIG_PLUGIN_TYPE, id, base })
}

const RESOLVERS = {
  npm: resolveNpm,
}
