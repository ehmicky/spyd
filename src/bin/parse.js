import filterObj from 'filter-obj'

import { mapValues } from '../utils/map.js'
import { recurseValues } from '../utils/recurse.js'

// We do not use yargs types as it conflicts with our own validation and
// normalization logic, e.g.:
//  - `number` parses invalid numbers as NaN
//  - `boolean` parses strings as boolean
//  - many configuration properties are objects or are polymorphic
// One downside is that typing then relies on yargs' guess, which is fine:
//  - string configuration properties cannot be "true", "false" or "1"
export const parseCliFlags = function (yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    ...configFlags
  } = yargs.parse()
  const configFlagsA = filterObj(configFlags, isUserProp)
  const configFlagsB = mapValues(configFlagsA, handleEmptyArr)
  const configFlagsC = recurseValues(configFlagsB, transtypeBoolean)
  return { command, configFlags: configFlagsC }
}

const DEFAULT_COMMAND = 'run'

// Remove `yargs`-specific properties and shortcuts.
// We do not remove dasherized properties because user-defined identifiers can
// use dashes and we disable yargs' `camel-case-expansion`.
const isUserProp = function (key, value) {
  return value !== undefined && !INTERNAL_KEYS.has(key) && key.length !== 1
}

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0'])

// Some configuration properties can optionally be arrays.
// We support setting empty arrays on those using `--NAME` or `--NAME ""`
//   - This is useful in many cases to remove the default value, for example
//     with the `config`, `reporter`, `select` and `limit` configuration
//     properties.
//   - This requires not using `requiresArg: true`
const handleEmptyArr = function (value, key) {
  return value === '' && ARRAY_PROPERTIES.has(key) ? [] : value
}

const ARRAY_PROPERTIES = new Set([
  'reporter',
  'select',
  'tasks',
  'runner',
  'limit',
  'config',
])

// Yargs interprets `--flag` and `--no-flag` with no arguments as booleans.
// Additionally, it interprets `--flag=true|false` as booleans instead of
// as strings when specifying the `boolean: true` option.
// However, we minimize Yargs parsing and validation since it is imperfect and
// does not well with:
//  - Object with dynamic property names
//  - Polymorphic types, such as "either boolean or array of booleans"
// Therefore, we perform this transformation manually.
const transtypeBoolean = function (value) {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return value
}
