import filterObj from 'filter-obj'

import { normalizeDynamicOpts } from './dynamic.js'

export const parseOpts = function(yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    ...opts
  } = yargs.parse()

  const optsA = normalizeDynamicOpts(opts)

  const optsB = filterObj(optsA, isUserOpt)
  return [command, optsB]
}

const DEFAULT_COMMAND = 'run'

// Remove `yargs`-specific options, shortcuts and dash-cased
const isUserOpt = function(key, value) {
  return (
    value !== undefined &&
    !INTERNAL_KEYS.includes(key) &&
    key.length !== 1 &&
    !key.includes('-')
  )
}

const INTERNAL_KEYS = ['help', 'version', '_', '$0']
