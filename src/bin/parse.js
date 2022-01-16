import filterObj from 'filter-obj'
import mapObj from 'map-obj'

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
  const configFlagsB = mapObj(configFlagsA, handleEmptyArr)
  return { command, configFlags: configFlagsB }
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
const handleEmptyArr = function (key, value) {
  return value === '' && ARRAY_PROPERTIES.has(key) ? [key, []] : [key, value]
}

const ARRAY_PROPERTIES = new Set([
  'reporter',
  'select',
  'tasks',
  'runner',
  'limit',
  'config',
])
