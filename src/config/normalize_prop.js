import { UserError } from '../error/main.js'

import { isDefinedPath } from './path.js'

// The `config` property can optionally be an array.
// The "default" resolver:
//  - Is the default of the top-level `config` CLI flags but not inside
//    configuration files
//  - Can be specified explicitely by users. This can be useful when overridding
//    a `config` property inherited from a child configuration.
export const normalizeConfigProp = function (config) {
  const configs = Array.isArray(config) ? config : [config]
  configs.forEach(validateConfigString)
  return configs
}

const validateConfigString = function (config) {
  if (typeof config !== 'string' || config.trim() === '') {
    throw new UserError(
      `The "config" property must be a non-empty string: ${config}`,
    )
  }
}

// If the configuration file is not a valid file path, it will be validated
// later
export const normalizeCwdProp = function (cwd) {
  return isDefinedPath(cwd) ? cwd : '.'
}
