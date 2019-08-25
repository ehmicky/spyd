import { cwd as getCwd } from 'process'
import { resolve } from 'path'

import uuidv4 from 'uuid/v4.js'

import { normalizeProgress } from '../progress/options.js'
import { normalizeDelta } from '../store/delta/options.js'
import { normalizeLimits } from '../limit/options.js'

import { validateStringArray, validatePositiveNumber } from './validate.js'

// Normalize options shape and do custom validation
export const normalizeOpts = function(opts) {
  return NORMALIZERS.reduce(normalizeOpt, opts)
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
const normalizeGroup = function({ group = uuidv4(), ...opts }) {
  const groupA = group.trim()
  return { ...opts, group: groupA }
}

// Normalize 'env' option
const normalizeEnv = function({ env = '', ...opts }) {
  const envA = env.trim()
  return { ...opts, env: envA }
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

// Normalize 'context' option
const normalizeContext = function({
  show,
  context = show !== undefined,
  ...opts
}) {
  return { ...opts, show, context }
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
  normalizeEnv,
  normalizeDuration,
  normalizeCwd,
  normalizeProgress,
  normalizeContext,
  normalizeShow,
  normalizeDiff,
  normalizeRemove,
  normalizeLimits,
]
