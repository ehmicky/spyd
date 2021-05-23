import { isDefinedPath } from './path.js'
import { DEFAULT_RESOLVER } from './resolve.js'

// The `config` property can optionally be an array.
// It is validated later, so if this is invalid, we just ignore it here.
// The "default" resolver:
//  - Is the default of the top-level `config` CLI flags but not inside
//    configuration files
//  - Can be specified explicitely by users. This can be useful when overridding
//    a `config` property inherited from a child configuration.
export const normalizeTopConfigProp = function (config) {
  const configs = normalizeConfigProp(config)
  return configs === undefined ? DEFAULT_RESOLVER : configs
}

export const normalizeConfigProp = function (config) {
  if (isDefinedPath(config)) {
    return [config]
  }

  if (Array.isArray(config) && config.every(isDefinedPath)) {
    return config
  }
}

// If the configuration file is not a valid file path, it will be validated
// later
export const normalizeCwdProp = function (cwd) {
  return isDefinedPath(cwd) ? cwd : '.'
}
