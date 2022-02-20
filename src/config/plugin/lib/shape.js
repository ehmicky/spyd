import { getDummyRules } from '../../normalize/dummy.js'
import { isParent } from '../../normalize/lib/prop_path/parse.js'
import { validateDefinedString } from '../../normalize/validate/simple.js'

import { PluginError, UserError, CoreError } from './error.js'
import { safeNormalizeConfig } from './normalize.js'

// Validate a plugin has the correct shape and normalize it
export const normalizeShape = async function ({
  plugin,
  locationType,
  originalLocation,
  opts: { shape, sharedPropNames, context },
}) {
  const pluginA = await safeNormalizeConfig(plugin, COMMON_SHAPE_RULES, {
    context: { sharedPropNames, locationType, originalLocation },
    UserErrorType: PluginError,
    SystemErrorType: CoreError,
  })

  if (shape === undefined) {
    return pluginA
  }

  return await safeNormalizeConfig(
    pluginA,
    [...getDummyRules(COMMON_SHAPE_RULES), ...shape],
    { context, UserErrorType: PluginError, SystemErrorType: UserError },
  )
}

const idProp = {
  name: 'id',
  required: true,
  validate(id, { context: { locationType, originalLocation } }) {
    validateDefinedString(id)
    validateIdCharacters(id)
    validateModuleLocation(id, locationType, originalLocation)
  },
  example(id, { context: { locationType, originalLocation } }) {
    return MODULE_LOCATION_TYPES.has(locationType)
      ? originalLocation
      : 'module-name'
  },
}

// We do not allow any delimiter characters such as . _ - nor uppercase letters
// because:
//  - the id is part of the npm package, which has strict validation rules
//  - we use dots in CLI flags for nested configuration properties
//  - we want to allow user-defined ids to use _ or -
//  - avoid mixing delimiters, so it's easier to remember for users
//  - consistent option name across spyd.yml, CLI flags, programmatic
// This is purposely not applied to shared configs.
const validateIdCharacters = function (id) {
  if (!PLUGIN_ID_REGEXP.test(id)) {
    throw new Error(`must only contain lowercase letters and digits.`)
  }
}

const PLUGIN_ID_REGEXP = /^[a-z][a-z\d]*$/u

// When using a Node module, the exported `id` must match the `location`
// specified by the user
const validateModuleLocation = function (id, locationType, originalLocation) {
  if (MODULE_LOCATION_TYPES.has(locationType) && originalLocation !== id) {
    throw new Error(`must be "${originalLocation}" to match the package name.`)
  }
}

// Those types must have the same `plugin.id` as the user-specified `location`
const MODULE_LOCATION_TYPES = new Set(['builtin', 'module'])

const configPropName = {
  name: 'config.*.name',
  validate(name, { context: { sharedPropNames } }) {
    if (isSharedProp(name, sharedPropNames)) {
      throw new Error(
        `must not redefine core configuration property "${name}".`,
      )
    }
  },
  example: 'propertyName',
}

const isSharedProp = function (name, sharedPropNames) {
  return (
    sharedPropNames.includes(name) ||
    sharedPropNames.some((sharedPropName) => isParent(name, sharedPropName))
  )
}

// Rules shared by all plugins
const COMMON_SHAPE_RULES = [idProp, configPropName]
