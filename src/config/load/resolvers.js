import { wrapError } from '../../error/wrap.js'
import { resolveModuleName } from '../module.js'

// The `config` can be:
//  - a file path
//  - a Node module name starting with "spyd-config-"
//  - a "resolver:arg" string which applies resolver-specific logic
export const isConfigFilePath = function (configOpt) {
  return !isNpmResolver(configOpt) && !isResolver(configOpt)
}

export const useResolvers = async function (configOpt, base) {
  if (isNpmResolver(configOpt)) {
    return resolveNpm(configOpt, base)
  }

  if (isResolver(configOpt)) {
    return await useResolver(configOpt, base)
  }

  return configOpt
}

// Configs can be Node modules.
// They must be named "spyd-config-{name}" to enforce naming convention and
// allow distinguishing them from file paths.
// We do not use a shorter id like "npm:{name}" so users do not need two
// different ids: one for `npm install` and one for the `config` property.
const isNpmResolver = function (configOpt) {
  return configOpt.startsWith(CONFIG_NPM_PREFIX)
}

export const CONFIG_NPM_PREFIX = 'spyd-config-'

// TODO: use import.meta.resolve() when available
const resolveNpm = function (configOpt, base) {
  const baseUrl = new URL(base, import.meta.url)

  try {
    return resolveModuleName(configOpt, CONFIG_NPM_PREFIX, baseUrl)
  } catch (error) {
    throw wrapError(
      error,
      `must be a valid package name.
This Node module was not found, please ensure it is installed.\n`,
    )
  }
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
    const resolvers = Object.keys(RESOLVERS).join(', ')
    throw new Error(`must use an existing resolver among ${resolvers}`)
  }

  return await resolverFunc(arg, base)
}

// We require at least two characters to differentiate from absolute file paths
// on Windows with drive letters. Enforcing lowercase also helps with this.
const RESOLVER_REGEXP = /^(?<name>[a-z]{2,}):(?<arg>.*)$/u

const RESOLVERS = {}
