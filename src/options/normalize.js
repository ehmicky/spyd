import { resolve } from 'path'

import { normalizeLimits } from '../limit/options.js'
import { normalizeProgress } from '../progress/options.js'
import { normalizeDelta } from '../store/delta/options.js'
import { normalizeStore } from '../store/options.js'
import { normalizeSystem } from '../system/normalize.js'

import { loadAllPlugins } from './plugins.js'
import { validateStringArray, validatePositiveNumber } from './validate.js'

// Normalize some options before assigning default values
export const preNormalizeOpts = function (opts) {
  const optsA = addRunners(opts)
  return optsA
}

// Add 'runners' option
const addRunners = function ({ run, ...opts }) {
  if (run === undefined) {
    return opts
  }

  const runners = Object.keys(run)
  return { ...opts, run, runners }
}

// Normalize options shape and do custom validation
export const normalizeOpts = async function (opts, action) {
  const optsA = NORMALIZERS.reduce(normalizeOpt, opts)
  const optsB = await loadAllPlugins(optsA)
  const optsC = await normalizeStore(optsB, action)
  const optsD = await normalizeSystem(optsC)
  return optsD
}

const normalizeOpt = function (opts, normalizer) {
  return normalizer(opts)
}

// Validate 'files' option
const normalizeFiles = function ({ files, ...opts }) {
  validateStringArray(files, 'files')
  return { ...opts, files }
}

// Validate 'tasks' option
const normalizeTasks = function ({ tasks, ...opts }) {
  validateStringArray(tasks, 'tasks')
  return { ...opts, tasks }
}

// Validate 'inputs' option
const normalizeInputs = function ({ inputs, ...opts }) {
  validateStringArray(inputs, 'inputs')
  return { ...opts, inputs }
}

// Normalize 'merge' option
const normalizeMerge = function ({ merge, ...opts }) {
  const mergeId = merge.trim()
  return { ...opts, mergeId }
}

// Normalize and validate 'duration' option
// Duration is specified in seconds by the user but we convert it to nanoseconds
const normalizeDuration = function ({ duration, ...opts }) {
  validatePositiveNumber(duration, 'duration')

  const durationA = duration * NANOSECS_TO_SECS
  return { ...opts, duration: durationA }
}

const NANOSECS_TO_SECS = 1e9

// Normalize 'cwd' option
const normalizeCwd = function ({ cwd, ...opts }) {
  const cwdA = resolve(cwd)
  return { ...opts, cwd: cwdA }
}

// Normalize 'delta' option
const normalizeDeltaOpt = function ({ delta, ...opts }) {
  const deltaA = normalizeDelta('delta', delta)
  return { ...opts, delta: deltaA }
}

// Normalize 'diff' option
const normalizeDiff = function ({ diff, ...opts }) {
  const diffA = normalizeDelta('diff', diff)
  return { ...opts, diff: diffA }
}

const NORMALIZERS = [
  normalizeFiles,
  normalizeTasks,
  normalizeInputs,
  normalizeMerge,
  normalizeDuration,
  normalizeCwd,
  normalizeProgress,
  normalizeDeltaOpt,
  normalizeDiff,
  normalizeLimits,
]
