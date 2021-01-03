import { PluginError } from '../error/main.js'

// Validate plugins shape
export const validatePlugins = function (plugins, type) {
  plugins.forEach((plugin) => {
    validatePlugin(plugin, type)
  })
}

const validatePlugin = function ({ id }, type) {
  if (!PLUGIN_ID_REGEXP.test(id)) {
    throw new PluginError(`The identifier of the ${type} "${id}" is invalid.
It should only contain lowercase letters and digits.`)
  }
}

// We purposely do not allow any delimiter characters such as . _ - nor
// uppercase letters because:
//  - the id is part of the npm package, which has strict validation rules
//  - we use dots in CLI flags for nested configuration properties
//  - we want to allow user-defined ids to use either _ or -
//  - environment variables (`SPYD_*`) only allow _
const PLUGIN_ID_REGEXP = /^[a-z][a-z0-9]*$/u
