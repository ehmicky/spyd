import filterObj from 'filter-obj'
import mapObj from 'map-obj'

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
  return value !== undefined && !INTERNAL_KEYS.has(key) && key.length !== 1
}

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0'])

// By default, yargs CLI parsing does not allow setting empty arrays.
// However, doing so is useful in many cases to remove the default value,
// for example with the `reporter`, `include`, `exclude` and `limit`
// configuration properties.
// We add support for empty arrays with CLI flags using the special notation
// `--NAME ""`. `--NAME=` and `--NAME=""` are not supported due to limitations
// with yargs.
// We do this at the CLI parsing level, to encourage programmatic usage and
// configuration files to use empty arrays instead, which is more proper and
// less polymorphic.
const handleEmptyArr = function (key, value) {
  if (!Array.isArray(value)) {
    return [key, value]
  }

  return [key, value.filter(isNotEmptyString)]
}

const isNotEmptyString = function (value) {
  return value !== ''
}
