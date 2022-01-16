import { resolve } from 'path'

import { isFile } from 'path-type'

import { UserError } from '../../error/main.js'
import { getPluginPath } from '../plugin/load.js'
import { CONFIG_PLUGIN_TYPE } from '../plugin/types.js'

// Resolve the `config` property to a file path. It can be:
//  - a file path
//  - a Node module name starting with "spyd-config-"
//  - a "resolver:arg" string which applies resolver-specific logic
export const resolveConfigPath = async function (configOpt, base) {
  if (isNpmResolver(configOpt)) {
    return resolveNpm(configOpt, base)
  }

  if (isResolver(configOpt)) {
    return await useResolver(configOpt, base)
  }

  return await resolveFile(configOpt, base)
}

// Configs can be Node modules.
// They must be named "spyd-config-{name}" to enforce naming convention and
// allow distinguishing them from file paths.
// We do not use a shorter id like "npm:{name}" so users do not need two
// different ids: one for `npm install` and one for the `config` property.
const isNpmResolver = function (configOpt) {
  return configOpt.startsWith(CONFIG_PLUGIN_TYPE.modulePrefix)
}

const resolveNpm = function (configOpt, base) {
  return getPluginPath(configOpt, CONFIG_PLUGIN_TYPE.type, base)
}

// Additional resolvers.
// We don't have any of them yet.
// Their name must be namespaced with "{resolver}:".
// We do not use this type of namespaces for the other resolvers since they are
// more commonly used.
const isResolver = function (configOpt) {
  return RESOLVER_REGEXP.test(configOpt)
}

const useResolver = async function (configOpt, base) {
  const {
    groups: { name, arg },
  } = RESOLVER_REGEXP.exec(configOpt)

  const resolverFunc = RESOLVERS[name]

  if (resolverFunc === undefined) {
    throw new UserError(`Resolver "${name}" does not exist: "${configOpt}"`)
  }

  return await resolverFunc(arg, base)
}

const RESOLVER_REGEXP = /^(?<name>[a-z]+):(?<arg>.*)$/u

const RESOLVERS = {}

const resolveFile = async function (configOpt, base) {
  const configPath = resolve(base, configOpt)

  if (!(await isFile(configPath))) {
    throw new UserError(`"config" file does not exist: ${configPath}`)
  }

  return configPath
}
