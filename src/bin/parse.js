import filterObj from 'filter-obj'

export const parseCliFlags = function (yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    ...configFlags
  } = yargs.parse()
  const configFlagsA = filterObj(configFlags, isUserProp)
  return { command, configFlags: configFlagsA }
}

const DEFAULT_COMMAND = 'bench'

// Remove `yargs`-specific properties, shortcuts and dash-cased
const isUserProp = function (key, value) {
  return (
    value !== undefined &&
    !INTERNAL_KEYS.has(key) &&
    key.length !== 1 &&
    !key.includes('-')
  )
}

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0'])
