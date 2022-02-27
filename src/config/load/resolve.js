import { createRequire } from 'module'

import { wrapError } from '../../error/wrap.js'

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
    throw wrapError(
      error,
      `must be a valid package name.
This Node module was not found, please ensure it is installed.\n`,
    )
  }
}

export const isConfigFilePath = function (configOpt) {
  return !isConfigFileModule(configOpt)
}

export const isConfigFileModule = function (configOpt) {
  return configOpt.includes(CONFIG_NPM_PREFIX)
}

export const CONFIG_NPM_PREFIX = 'spyd-config-'