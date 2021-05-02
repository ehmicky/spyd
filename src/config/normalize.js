import { normalizeDelta } from '../delta/main.js'
import { normalizePrecision } from '../measure/precision.js'

import {
  normalizeArray,
  normalizeOptionalArray,
  checkDefinedString,
  checkJson,
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
  precision: normalizePrecision,
  system: normalizeSystem,
  delta: normalizeDeltaProp,
  since: normalizeDeltaProp,
  runner: normalizeArrayProp,
  reporter: normalizeOptionalArrProp,
  select: normalizeOptionalArrProp,
  limit: normalizeOptionalArrProp,
  titles: checkTitles,
  inputs: checkInputs,
}
