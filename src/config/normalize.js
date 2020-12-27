import { resolve } from 'path'

import { normalizeLimits } from '../limit/config.js'
import { normalizeQuiet } from '../progress/config.js'
import { normalizeDelta } from '../store/delta/config.js'
import { normalizeSystem } from '../system/normalize.js'

import { loadAllPlugins } from './plugins.js'
import {
  validateStringArray,
  validatePositiveInteger,
  validateSaveDuration,
} from './validate.js'

// Normalize some configuration properties before assigning default values
export const preNormalizeConfig = function (config) {
  const configA = addRunners(config)
  return configA
}

// Add 'runners' configuration property
const addRunners = function ({ run, ...config }) {
  if (run === undefined) {
    return config
  }

  const runners = Object.keys(run)
  return { ...config, run, runners }
}

// Normalize configuration shape and do custom validation
export const normalizeConfig = async function (config) {
  const configA = NORMALIZERS.reduce(normalizeProp, config)
  const configB = await loadAllPlugins(configA)
  const configC = normalizeSystem(configB)
  return configC
}

const normalizeProp = function (config, normalizer) {
  return normalizer(config)
}

const normalizeFiles = function ({ files, ...config }) {
  validateStringArray(files, 'files')
  return { ...config, files }
}

const normalizeTasks = function ({ tasks, ...config }) {
  validateStringArray(tasks, 'tasks')
  return { ...config, tasks }
}

const normalizeInputs = function ({ inputs, ...config }) {
  validateStringArray(inputs, 'inputs')
  return { ...config, inputs }
}

const normalizeMerge = function ({ merge, ...config }) {
  const mergeId = merge.trim()
  return { ...config, mergeId }
}

// Duration is specified in seconds by the user but we convert it to nanoseconds
const normalizeDuration = function ({ duration, save, ...config }) {
  validatePositiveInteger(duration, 'duration')
  validateSaveDuration(duration, save)

  const durationA = duration <= 1 ? duration : duration * NANOSECS_TO_SECS
  return { ...config, duration: durationA, save }
}

const NANOSECS_TO_SECS = 1e9

const normalizeCwd = function ({ cwd, ...config }) {
  const cwdA = resolve(cwd)
  return { ...config, cwd: cwdA }
}

const normalizeDeltaProp = function ({ delta, ...config }) {
  const deltaA = normalizeDelta('delta', delta)
  return { ...config, delta: deltaA }
}

const normalizeDiff = function ({ diff, ...config }) {
  const diffA = normalizeDelta('diff', diff)
  return { ...config, diff: diffA }
}

const normalizeLimit = function ({ limit, ...config }) {
  validateStringArray(limit, 'limit')
  const limits = normalizeLimits(limit)
  return { ...config, limits }
}

const NORMALIZERS = [
  normalizeFiles,
  normalizeTasks,
  normalizeInputs,
  normalizeMerge,
  normalizeDuration,
  normalizeCwd,
  normalizeQuiet,
  normalizeDeltaProp,
  normalizeDiff,
  normalizeLimit,
]
