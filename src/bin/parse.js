import { omitBy } from '../utils/main.js'

import { normalizeDynamicOpts } from './dynamic.js'

export const parseOpts = function(yargs) {
  const {
    _: [file],
    report,
    ...opts
  } = yargs.parse()

  const reportA = normalizeDynamicOpts(report)
  const optsA = { ...opts, file, report: reportA }
  const optsB = omitBy(optsA, isInternalKey)
  return optsB
}

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
