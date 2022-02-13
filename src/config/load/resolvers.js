import { createRequire } from 'module'

import { wrapError } from '../../error/wrap.js'

// The `config` can be:
//  - a Node module name starting with "[@scope/]spyd-config-"
//  - a "resolver:arg" string which applies resolver-specific logic
//  - a file path
export const useResolvers = async function (configOpt, { cwd }) {
  if (isConfigFileModule(configOpt)) {
    return resolveNpm(configOpt, cwd)
  }

  if (isConfigFileResolver(configOpt)) {
    return await useResolver(configOpt, cwd)
  }

  return configOpt
}

export const isConfigFileModule = function (configOpt) {
  return configOpt.includes(CONFIG_NPM_PREFIX)
}

export const CONFIG_NPM_PREFIX = 'spyd-config-'

const isConfigFileResolver = function (configOpt) {
  return RESOLVER_REGEXP.test(configOpt)
}

export const isConfigFilePath = function (configOpt) {
  return !isConfigFileModule(configOpt) && !isConfigFileResolver(configOpt)
}

// TODO: use import.meta.resolve() when available
const resolveNpm = function (configOpt, cwd) {
  try {
    return createRequire(`${cwd}/`).resolve(configOpt)
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
const useResolver = async function (configOpt, cwd) {
  const {
    groups: { name, arg },
  } = RESOLVER_REGEXP.exec(configOpt)

  const resolverFunc = RESOLVERS[name]

  if (resolverFunc === undefined) {
    const resolvers = Object.keys(RESOLVERS).join(', ')
    throw new Error(`must use an existing resolver among ${resolvers}`)
  }

  return await resolverFunc(arg, cwd)
}

// We require at least two characters to differentiate from absolute file paths
// on Windows with drive letters. Enforcing lowercase also helps with this.
const RESOLVER_REGEXP = /^(?<name>[a-z]{2,}):(?<arg>.*)$/u

const RESOLVERS = {}
