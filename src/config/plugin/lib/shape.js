import { PluginError } from '../../../error/main.js'
import { isParent } from '../../normalize/lib/prop_path/parse.js'
import { normalizeConfig } from '../../normalize/main.js'
import { validateDefinedString } from '../../normalize/validate/simple.js'

// Validate a plugin has the correct shape and normalize it
export const normalizeShape = async function (plugin, shape, sharedPropNames) {
  return await normalizeConfig(plugin, [...COMMON_SHAPE, ...shape], {
    context: { sharedPropNames },
    UserErrorType: PluginError,
  })
}

const idProp = {
  name: 'id',
  required: true,
  validate(id) {
    validateDefinedString(id)
    validateIdCharacters(id)
  },
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
const validateIdCharacters = function (id) {
  if (!PLUGIN_ID_REGEXP.test(id)) {
    throw new Error(`must only contain lowercase letters and digits.`)
  }
}

const PLUGIN_ID_REGEXP = /^[a-z][a-z\d]*$/u

const configPropName = {
  name: 'config.*.name',
  validate(name, { context: { sharedPropNames } }) {
    if (isSharedProp(name, sharedPropNames)) {
      throw new Error(
        `must not redefine core configuration property "${name}".`,
      )
    }
  },
}

const isSharedProp = function (name, sharedPropNames) {
  return (
    sharedPropNames.includes(name) ||
    sharedPropNames.some((sharedPropName) => isParent(name, sharedPropName))
  )
}

// Definitions shared by all plugins
const COMMON_SHAPE = [idProp, configPropName]
