import { cwd as getCwd } from 'process'
import { resolve } from 'path'

import { normalizeProgress } from '../progress/options.js'
import { normalizeData } from '../save/options.js'

import {
  validateStringArray,
  validateDeepObject,
  validatePositiveNumber,
} from './validate.js'

// Normalize options shape and do custom validation
export const normalizeOpts = async function(opts) {
  const optsA = NORMALIZERS.reduce(normalizeOpt, opts)
  const optsB = await normalizeData(optsA)
  return optsB
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

// Normalize and validate 'store' option
const normalizeStores = function({ store: storeOpts, ...opts }) {
  validateDeepObject(storeOpts, 'store')
  return { ...opts, storeOpts }
}

const NORMALIZERS = [
  normalizeFiles,
  normalizeTasks,
  normalizeVariations,
  normalizeDuration,
  normalizeCwd,
  normalizeProgress,
  normalizeStores,
]
