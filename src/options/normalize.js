import { cwd as getCwd } from 'process'
import { resolve } from 'path'

import { normalizeProgress } from '../progress/options.js'
import { normalizeDelta } from '../store/delta/options.js'
import { normalizeLimits } from '../limit/options.js'
import { normalizeStore } from '../store/options.js'
import { normalizeSystem } from '../system/normalize.js'

import { validateStringArray, validatePositiveNumber } from './validate.js'
import { loadAllPlugins } from './plugins.js'

// Normalize options shape and do custom validation
export const normalizeOpts = async function(opts) {
  const optsA = NORMALIZERS.reduce(normalizeOpt, opts)
  const optsB = await loadAllPlugins(optsA)
  const optsC = await normalizeStore(optsB)
  const optsD = normalizeSystem(optsC)
  return optsD
}

const normalizeOpt = function(opts, normalizer) {
  return normalizer(opts)
}

// Validate 'files' option
const normalizeFiles = function({ files, ...opts }) {
  validateStringArray(files, 'files')
  return { ...opts, files }
}

// Validate 'tasks' option
const normalizeTasks = function({ tasks, ...opts }) {
  validateStringArray(tasks, 'tasks')
  return { ...opts, tasks }
}

// Validate 'variations' option
const normalizeVariations = function({ variations, ...opts }) {
  validateStringArray(variations, 'variations')
  return { ...opts, variations }
}

// Normalize 'group' option
const normalizeGroup = function({ group, ...opts }) {
  const groupA = group.trim()
  return { ...opts, group: groupA }
}

// Normalize and validate 'duration' option
// Duration is specified in seconds by the user but we convert it to nanoseconds
const normalizeDuration = function({ duration, ...opts }) {
  validatePositiveNumber(duration, 'duration')

  const durationA = duration * NANOSECS_TO_SECS
  return { ...opts, duration: durationA }
}

const NANOSECS_TO_SECS = 1e9

// Normalize 'cwd' option
const normalizeCwd = function({ cwd, ...opts }) {
  const cwdA = resolve(getCwd(), cwd)
  return { ...opts, cwd: cwdA }
}

// Normalize 'show' option
const normalizeShow = function({ show, ...opts }) {
  const showA = normalizeDelta('show', show)
  return { ...opts, show: showA }
}

// Normalize 'diff' option
const normalizeDiff = function({ diff, ...opts }) {
  const diffA = normalizeDelta('diff', diff)
  return { ...opts, diff: diffA }
}

// Normalize 'remove' option
const normalizeRemove = function({ remove, ...opts }) {
  const removeA = normalizeDelta('remove', remove)
  return { ...opts, remove: removeA }
}

const NORMALIZERS = [
  normalizeFiles,
  normalizeTasks,
  normalizeVariations,
  normalizeGroup,
  normalizeDuration,
  normalizeCwd,
  normalizeProgress,
  normalizeShow,
  normalizeDiff,
  normalizeRemove,
  normalizeLimits,
]
