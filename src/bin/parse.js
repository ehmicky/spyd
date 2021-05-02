import filterObj from 'filter-obj'
import mapObj from 'map-obj'

import { ALIASES } from './config/aliases.js'

// Yargs CLI parsing supports setting empty arrays using `--NAME`, `--NAME=` or
// `--NAME=""`
//   - This is useful in many cases to remove the default value, for example
//     with the `reporter`, `select`, `exclude` and `limit` configuration
//     properties.
//   - This requires not using `requiresArg: true` when `array: true` is used.
export const parseCliFlags = function (yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    ...configFlags
  } = yargs.parse()
  const configFlagsA = filterObj(configFlags, isUserProp)
  const configFlagsB = mapObj(configFlagsA, handleEmptyArr)
  return { command, configFlags: configFlagsB }
}

const DEFAULT_COMMAND = 'bench'

// Remove `yargs`-specific properties and shortcuts.
// We do not remove dasherized properties because user-defined identifiers can
// use dashes and we disable yargs' `camel-case-expansion`.
const isUserProp = function (key, value) {
  return value !== undefined && !INTERNAL_KEYS.has(key) && !ALIASES.has(key)
}

// = is due to a bug in Yargs (https://github.com/yargs/yargs/issues/1860)
const INTERNAL_KEYS = new Set(['help', 'version', '_', '=', '$0'])

// Due to a bug in Yargs (https://github.com/yargs/yargs/issues/1859)
const handleEmptyArr = function (key, value) {
  if (!Array.isArray(value)) {
    return [key, value]
  }

  return [key, value.filter(isNotEmptyString)]
}

const isNotEmptyString = function (value) {
  return value !== ''
}
