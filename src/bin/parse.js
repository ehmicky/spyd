import { excludeKeys } from 'filter-obj'

import { mapValues } from '../utils/map.js'

// We do not use yargs types for:
//  - `number`:
//     - yargs parses invalid numbers as NaN, which results in a poorer error
//       message
//     - yargs automatic type guess is better there, since it keeps invalid
//       numbers as strings
//  - Properties with dynamic keys or polymorphic values
// However, we try to use yargs types for:
//  - `boolean`: this enables boolean flags to be followed by a command or
//    another flag, while still allowing passing "true|false" to them
//  - `string`: this enables values to be "true", "false" or "1"
export const parseCliFlags = function (yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    ...configFlags
  } = yargs.parse()
  const configFlagsA = excludeKeys(configFlags, isInternalProp)
  const configFlagsB = mapValues(configFlagsA, handleEmptyArr)
  return { command, configFlags: configFlagsB }
}

const DEFAULT_COMMAND = 'run'

// Remove `yargs`-specific properties and shortcuts.
// We do not remove dasherized properties because user-defined identifiers can
// use dashes and we disable yargs' `camel-case-expansion`.
const isInternalProp = function (key, value) {
  return value === undefined || INTERNAL_KEYS.has(key) || key.length === 1
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
