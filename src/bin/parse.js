import { omitBy } from '../utils/main.js'

import { normalizeDynamicOpts } from './dynamic.js'

export const parseOpts = function(yargs) {
  const { _: files, report, progress, run, ...opts } = yargs.parse()

  const filesA = files.length === 0 ? undefined : files
  const reportA = normalizeDynamicOpts(report)
  const progressA = normalizeDynamicOpts(progress)
  const runA = normalizeDynamicOpts(run)
  const optsA = {
    ...opts,
    files: filesA,
    report: reportA,
    progress: progressA,
    run: runA,
  }
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
