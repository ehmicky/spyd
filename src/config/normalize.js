import { normalizeDelta } from '../delta/main.js'
import { checkEmptyTasks } from '../run/check.js'

import {
  normalizeArray,
  normalizeOptionalArray,
  checkDefinedString,
  checkJson,
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

const normalizeDeltaProp = function (delta, propName, { envInfo }) {
  return { [propName]: normalizeDelta(delta, propName, envInfo) }
}

const normalizeArrayProp = function (value, propName) {
  return { [propName]: normalizeArray(value, propName) }
}

const normalizeOptionalArrProp = function (value, propName) {
  return { [propName]: normalizeOptionalArray(value, propName) }
}

const checkTitles = function (titles, propName) {
  Object.entries(titles).forEach(([childName, value]) => {
    checkDefinedString(value, `${propName}.${childName}`)
  })
}

const checkInputs = function (inputs, propName) {
  Object.entries(inputs).forEach(([childName, value]) => {
    checkJson(value, `${propName}.${childName}`)
  })
}

const NORMALIZERS = {
  duration: normalizeDuration,
  system: normalizeSystem,
  delta: normalizeDeltaProp,
  since: normalizeDeltaProp,
  runner: normalizeArrayProp,
  reporter: normalizeOptionalArrProp,
  progress: normalizeOptionalArrProp,
  store: normalizeOptionalArrProp,
  include: normalizeOptionalArrProp,
  exclude: normalizeOptionalArrProp,
  limit: normalizeOptionalArrProp,
  tasks: checkEmptyTasks,
  titles: checkTitles,
  inputs: checkInputs,
}
