import { normalizeLimits } from '../limit/config.js'
import { normalizeDelta } from '../store/delta/config.js'

import {
  checkObject,
  checkStringArray,
  checkDefinedString,
  checkPositiveInteger,
  checkSaveDuration,
} from './check.js'

// Normalize configuration shape and do custom validation
export const normalizeConfig = function (config) {
  return Object.entries(NORMALIZERS).reduce(normalizeProp, config)
}

const normalizeProp = function (config, [propName, normalizer]) {
  const { [propName]: value, ...configA } = config
  const props = normalizer(value, propName, configA)

  if (props === undefined) {
    return config
  }

  return { ...configA, ...props }
}

const normalizeDuration = function (duration, propName, { save }) {
  checkPositiveInteger(duration, propName)
  checkSaveDuration(duration, save)

  if (duration === 0 || duration === 1) {
    return
  }

  return { [propName]: duration * NANOSECS_TO_SECS }
}

// Duration is specified in seconds by the user but we convert it to nanoseconds
const NANOSECS_TO_SECS = 1e9

// In order to pass dynamic information, the user should either:
//  - use shell features like subshells and environment variable expansion
//  - use `SPYD_*` environment variables
const normalizeSystem = function (system) {
  return { systemId: system }
}

const normalizeMerge = function (merge) {
  return { mergeId: merge.trim() }
}

const normalizeLimit = function (limit, propName) {
  checkStringArray(limit, propName)
  return { limits: normalizeLimits(limit) }
}

const normalizeDeltaProp = function (delta, propName) {
  return { [propName]: normalizeDelta(delta, propName) }
}

const checkStringArrayProp = function (value, propName) {
  checkStringArray(value, propName)
}

const checkTasks = function (tasks, propName) {
  checkObject(tasks, propName)
  Object.entries(tasks).forEach(([childName, value]) => {
    checkStringArray(value, `${propName}.${childName}`)
  })
}

const checkPluginOpts = function (pluginOpts, propName) {
  checkObject(pluginOpts, propName)
  Object.entries(pluginOpts).forEach(([childName, value]) => {
    checkObject(value, `${propName}.${childName}`)
  })
}

const checkTitles = function (titles, propName) {
  checkObject(titles, propName)
  Object.entries(titles).forEach(([childName, value]) => {
    checkDefinedString(value, `${propName}.${childName}`)
  })
}

const checkInputs = function (inputs, propName) {
  checkObject(inputs, propName)
}

const NORMALIZERS = {
  duration: normalizeDuration,
  system: normalizeSystem,
  merge: normalizeMerge,
  limit: normalizeLimit,
  delta: normalizeDeltaProp,
  diff: normalizeDeltaProp,
  reporters: checkStringArrayProp,
  progresses: checkStringArrayProp,
  stores: checkStringArrayProp,
  include: checkStringArrayProp,
  exclude: checkStringArrayProp,
  tasks: checkTasks,
  runner: checkPluginOpts,
  reporter: checkPluginOpts,
  progress: checkPluginOpts,
  store: checkPluginOpts,
  titles: checkTitles,
  input: checkInputs,
}
