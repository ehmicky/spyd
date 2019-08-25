import { omitBy } from '../utils/main.js'

import { normalizeDynamicOpts } from './dynamic.js'

export const parseOpts = function(yargs) {
  const {
    _: [command = DEFAULT_COMMAND],
    report,
    progress,
    run,
    store,
    ...opts
  } = yargs.parse()

  const reportA = normalizeDynamicOpts(report)
  const progressA = normalizeDynamicOpts(progress)
  const runA = normalizeDynamicOpts(run)
  const storeA = normalizeDynamicOpts(store)
  const optsA = {
    ...opts,
    report: reportA,
    progress: progressA,
    run: runA,
    store: storeA,
  }
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
