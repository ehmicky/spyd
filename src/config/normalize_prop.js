import { UserError } from '../error/main.js'

// The `config` property can optionally be an array.
// The "default" resolver:
//  - Is the default of the top-level `config` CLI flags but not inside
//    configuration files
//  - Can be specified explicitely by users. This can be useful when overridding
//    a `config` property inherited from a child configuration.
export const normalizeConfigProp = function (config) {
  const configs = Array.isArray(config) ? config : [config]
  configs.forEach((configA) => {
    validateDefinedString(configA, 'config')
  })
  return configs
}

export const validateDefinedString = function (value, propName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new UserError(
      `The "${propName}" property must be a non-empty string: ${value}`,
    )
  }
}
