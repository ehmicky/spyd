import { resolve } from 'path'

import { normalizeLimits } from '../limit/config.js'
import { normalizeQuiet } from '../progress/config.js'
import { normalizeDelta } from '../store/delta/config.js'

import {
  checkStringArray,
  checkPositiveInteger,
  checkSaveDuration,
} from './check.js'
import { loadAllPlugins } from './plugins.js'

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

const normalizeTasks = function ({ tasks, ...config }) {
  checkStringArray(tasks, 'tasks')
  return { ...config, tasks }
}

const normalizeInputs = function ({ inputs, ...config }) {
  checkStringArray(inputs, 'inputs')
  return { ...config, inputs }
}

// In order to pass dynamic information, the user should either:
//  - use shell features like subshells and environment variable expansion
//  - use `SPYD_*` environment variables
const normalizeSystem = function ({ system, ...config }) {
  return { ...config, systemId: system }
}

const normalizeMerge = function ({ merge, ...config }) {
  const mergeId = merge.trim()
  return { ...config, mergeId }
}

// Duration is specified in seconds by the user but we convert it to nanoseconds
const normalizeDuration = function ({ duration, save, ...config }) {
  checkPositiveInteger(duration, 'duration')
  checkSaveDuration(duration, save)

  const durationA =
    duration === 0 || duration === 1 ? duration : duration * NANOSECS_TO_SECS
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
  checkStringArray(limit, 'limit')
  const limits = normalizeLimits(limit)
  return { ...config, limits }
}

const NORMALIZERS = [
  normalizeTasks,
  normalizeInputs,
  normalizeSystem,
  normalizeMerge,
  normalizeDuration,
  normalizeCwd,
  normalizeQuiet,
  normalizeDeltaProp,
  normalizeDiff,
  normalizeLimit,
]
