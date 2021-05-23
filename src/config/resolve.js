import { resolve } from 'path'

import findUp from 'find-up'
import { isFile } from 'path-type'

import { UserError } from '../error/main.js'
import { getPluginPath } from '../plugin/load.js'
import { CONFIG_PLUGIN_TYPE } from '../plugin/types.js'

// Resolve the `config` property to a file path. It can be:
//  - "default": lookup for any `spyd.*` or `benchmark/spyd.*` file
//  - a file path
//  - a Node module name starting with "spyd-config-"
//  - a "resolver:arg" string which applies resolver-specific logic
export const resolveConfigPath = async function (config, base) {
  if (config === 'default') {
    return await resolveDefault(base)
  }

  if (isNpmResolver(config)) {
    return resolveNpm(config, base)
  }

  const result = RESOLVER_REGEXP.exec(config)

  if (result === null) {
    return await resolveFile(config, base)
  }

  const [, resolverName, resolverArg] = result
  return await useResolver({ config, base, resolverName, resolverArg })
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

// Configs can be Node modules.
// They must be named "spyd-config-{name}" to enforce naming convention and
// allow distinguishing them from file paths.
// We do not use a shorter id like "npm:{name}" so users do not need two
// different ids: one for `npm install` and one for the `config` property.
const isNpmResolver = function (id) {
  return id.startsWith(CONFIG_PLUGIN_TYPE.modulePrefix)
}

const resolveNpm = function (id, base) {
  return getPluginPath({ ...CONFIG_PLUGIN_TYPE, id, base })
}

const resolveFile = async function (config, base) {
  if (!(await isFile(config))) {
    throw new UserError(`"config" file does not exist: "${config}"`)
  }

  return resolve(base, config)
}

// Additional resolvers.
// We don't have any of them yet.
// Their name must be namespaced with "{resolver}:".
// We do not use this type of namespaces for the other resolvers since they are
// more commonly used.
const useResolver = async function ({
  config,
  base,
  resolverName,
  resolverArg,
}) {
  const resolverFunc = RESOLVERS[resolverName]

  if (resolverFunc === undefined) {
    throw new UserError(
      `Resolver "${resolverName}" does not exist: "${config}"`,
    )
  }

  return await resolverFunc(resolverArg, base)
}

const RESOLVER_REGEXP = /^([a-z]+):(.*)$/u

const RESOLVERS = {}
