import { getDummyRules } from '../../normalize/dummy.js'

import { PluginError, UserError } from './error.js'
import { safeNormalizeConfig } from './normalize.js'
import { normalizeRuleName, validateSharedProp } from './shared.js'

// Validate a plugin has the correct shape and normalize it, using builtin
// definition.
export const normalizeCommonShape = async function ({
  plugin,
  locationType,
  originalLocation,
  opts: { sharedPropNames, keywords },
}) {
  return await safeNormalizeConfig(plugin, COMMON_SHAPE_RULES, {
    all: {
      prefix: PLUGIN_PREFIX,
      context: { sharedPropNames, locationType, originalLocation },
    },
    keywords,
    InputErrorType: PluginError,
    DefinitionErrorType: Error,
  })
}

// Validate a plugin has the correct shape and normalize it, using `shape`
// option.
export const normalizeCustomShape = async function (
  plugin,
  { shape, context, keywords },
) {
  return shape === undefined
    ? plugin
    : await safeNormalizeConfig(
        plugin,
        new Set([getDummyRules(COMMON_SHAPE_RULES), shape]),
        {
          all: { prefix: PLUGIN_PREFIX, context },
          keywords,
          InputErrorType: PluginError,
          DefinitionErrorType: UserError,
        },
      )
}

const PLUGIN_PREFIX = 'Plugin property'

// We do not allow any delimiter characters such as . _ - nor uppercase letters
// because:
//  - the id is part of the npm package, which has strict validation rules
//  - we use dots in CLI flags for nested configuration properties
//  - we want to allow user-defined ids to use _ or -
//  - avoid mixing delimiters, so it's easier to remember for users
//  - consistent option name across spyd.yml, CLI flags, programmatic
// This is purposely not applied to shared configs.
const PLUGIN_ID_REGEXP = /^[a-z]?[a-z\d]*$/u

// Those types must have the same `plugin.id` as the user-specified `location`
const MODULE_LOCATION_TYPES = new Set(['builtin', 'module'])

const transformConfigPropName = function (name) {
  try {
    return normalizeRuleName(name)
  } catch (error) {
    throw new Error(`must be valid: ${error.message}`)
  }
}

// Rules shared by all plugins
const COMMON_SHAPE_RULES = new Set([
  {
    name: 'id',
    required: true,
    schema: {
      type: 'string',
      minLength: 1,
      regexp: String(PLUGIN_ID_REGEXP),
      errorMessage: {
        minLength: 'must not be an empty string',
        regexp: 'must only contain lowercase letters and digits',
      },
    },
    // When using a Node module, the exported `id` must match the `location`
    // specified by the user
    validate(id, { context: { locationType, originalLocation } }) {
      if (MODULE_LOCATION_TYPES.has(locationType) && originalLocation !== id) {
        throw new Error(
          `must be "${originalLocation}" to match the package name.`,
        )
      }
    },
    example({ context: { locationType, originalLocation } }) {
      return MODULE_LOCATION_TYPES.has(locationType)
        ? originalLocation
        : 'module-name'
    },
  },
  {
    name: 'bugsUrl',
    schema: { type: 'string', minLength: 1, format: 'uri' },
    example(value, { inputs: { id } }) {
      return `https://github.com/my-user/${id}/issues`
    },
  },
  {
    name: 'config.*.name',
    transform(name, { context: { sharedPropNames } }) {
      const nameA = transformConfigPropName(name)
      validateSharedProp(nameA, sharedPropNames)
      return nameA
    },
    example: 'propertyName',
  },
])
