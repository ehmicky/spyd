import { omitBy } from '../utils/main.js'

import { normalizeDynamicOpts } from './dynamic.js'

export const parseOpts = function(yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    ...opts
  } = yargs.parse()

  const optsA = normalizeDynamicOpts(opts)

  const optsB = omitBy(optsA, isInternalKey)
  return [command, optsB]
}

const DEFAULT_COMMAND = 'run'

// Remove `yargs`-specific options, shortcuts and dash-cased
const isInternalKey = function(key, value) {
  return (
    value === undefined ||
    INTERNAL_KEYS.includes(key) ||
    key.length === 1 ||
    key.includes('-')
  )
}

const INTERNAL_KEYS = ['help', 'version', '_', '$0']
