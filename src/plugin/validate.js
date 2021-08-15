import { PluginError } from '../error/main.js'

// Validate plugins shape
export const validatePlugins = function (plugins, type) {
  plugins.forEach((plugin) => {
    validatePlugin(plugin, type)
  })
}

const validatePlugin = function ({ moduleId }, type) {
  if (!PLUGIN_ID_REGEXP.test(moduleId)) {
    throw new PluginError(`The identifier of the ${type} "${moduleId}" is invalid.
It should only contain lowercase letters and digits.`)
  }
}

// We do not allow any delimiter characters such as . _ - nor uppercase letters
// because:
//  - the id is part of the npm package, which has strict validation rules
//  - we use dots in CLI flags for nested configuration properties
//  - we want to allow user-defined ids to use _ or -
//  - avoid mixing delimiters, so it's easier to remember for users
//  - consistent option name across spyd.yml, CLI flags, programmatic
// This does not apply to the optional user-defined prefix.
// This is purposely not applied to shared configs.
const PLUGIN_ID_REGEXP = /^[a-z][a-z\d]*$/u
