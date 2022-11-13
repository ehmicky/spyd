import { createRequire } from 'node:module'

import { BaseError } from '../../error/main.js'

// The `config` can be:
//  - a Node module name starting with "[@scope/]spyd-config-"
//  - a file path
// In the future, this might be expanded with more ways to load the
// configuration.
//  - We should then a "resolver:arg" syntax
//     - `resolver should be lowercase and at least 2 characters long, to avoid
//       confusion with Windows drive letters
export const resolveConfig = function (configOpt, { cwd }) {
  return isConfigFileModule(configOpt) ? resolveNpm(configOpt, cwd) : configOpt
}

// TODO: use import.meta.resolve() when available
const resolveNpm = function (configOpt, cwd) {
  try {
    return createRequire(`${cwd}/`).resolve(configOpt)
  } catch (error) {
    throw new BaseError(
      `must be a valid package name.
This Node module was not found, please ensure it is installed:\n`,
      { cause: error },
    )
  }
}

export const normalizeConfigFilePath = function (configOpt) {
  return isConfigFileModule(configOpt) ? undefined : ['exist', 'file', 'read']
}

export const isConfigFileModule = function (configOpt) {
  return typeof configOpt === 'string' && configOpt.includes(CONFIG_NPM_PREFIX)
}

export const CONFIG_NPM_PREFIX = 'spyd-config-'
