import { omitBy } from '../utils/main.js'

import { normalizeDynamicOpts } from './dynamic.js'

export const parseOpts = function(yargs) {
  const { _: files, report, progress, ...opts } = yargs.parse()

  const reportA = normalizeDynamicOpts(report)
  const progressA = normalizeDynamicOpts(progress)
  const optsA = { ...opts, files, report: reportA, progress: progressA }
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
