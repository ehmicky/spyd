import { resolve } from 'path'

import { isFile } from 'path-type'

import { UserError } from '../error/main.js'
import { getPluginPath } from '../plugin/load.js'
import { CONFIG_PLUGIN_TYPE } from '../plugin/types.js'

// Resolve the `config` property to a file path. It can be:
//  - a file path
//  - a Node module name starting with "spyd-config-"
//  - a "resolver:arg" string which applies resolver-specific logic
export const resolveConfigPath = async function (config, base) {
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

// Configs can be Node modules.
// They must be named "spyd-config-{name}" to enforce naming convention and
// allow distinguishing them from file paths.
// We do not use a shorter id like "npm:{name}" so users do not need two
// different ids: one for `npm install` and one for the `config` property.
const isNpmResolver = function (config) {
  return config.startsWith(CONFIG_PLUGIN_TYPE.modulePrefix)
}

const resolveNpm = function (config, base) {
  return getPluginPath(config, CONFIG_PLUGIN_TYPE.type, base)
}

const resolveFile = async function (config, base) {
  const configA = resolve(base, config)

  if (!(await isFile(configA))) {
    throw new UserError(`"config" file does not exist: ${configA}`)
  }

  return configA
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
