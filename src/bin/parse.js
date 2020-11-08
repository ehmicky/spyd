import filterObj from 'filter-obj'

import { normalizeArrayOpts } from './array.js'
import { normalizeDynamicOpts } from './dynamic.js'

export const parseOpts = function (yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    ...opts
  } = yargs.parse()

  const optsA = normalizeDynamicOpts(opts)
  const optsB = normalizeArrayOpts(optsA)

  const optsC = filterObj(optsB, isUserOpt)
  return [command, optsC]
}

const DEFAULT_COMMAND = 'run'

// Remove `yargs`-specific options, shortcuts and dash-cased
const isUserOpt = function (key, value) {
  return (
    value !== undefined &&
    !INTERNAL_KEYS.has(key) &&
    key.length !== 1 &&
    !key.includes('-')
  )
}

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0'])
