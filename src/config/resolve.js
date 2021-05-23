import { resolve } from 'path'

import findUp from 'find-up'
import { isFile } from 'path-type'

import { UserError } from '../error/main.js'
import { getPluginPath } from '../plugin/load.js'
import { CONFIG_PLUGIN_TYPE } from '../plugin/types.js'

// Resolve the `config` property to a file path. It can be:
//  - "default": lookup for any `spyd.*` or `benchmark/spyd.*` file
//  - a file path
//  - a "resolver:arg" string which applies resolver-specific logic
// The available resolvers are:
//  - "npm:name" to load a Node module "spyd-config-name" or "@spyd/config-name"
export const resolveConfigPath = async function (config, base) {
  if (config === 'default') {
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

const RESOLVER_REGEXP = /^([a-z]+):(.*)$/u

const resolveFile = async function (config, base) {
  if (!(await isFile(config))) {
    throw new UserError(`"config" file does not exist: '${config}'`)
  }

  return resolve(base, config)
}

const resolveNpm = function (id, base) {
  return getPluginPath({ ...CONFIG_PLUGIN_TYPE, id, base })
}

const RESOLVERS = {
  npm: resolveNpm,
}
