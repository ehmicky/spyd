import { parseLimit } from '../history/compare/parse.js'
import { normalizeMerge } from '../history/merge/id.js'
import { normalizePrecision } from '../run/precision.js'

import {
  checkStringsObject,
  normalizeOptionalArray,
  checkArrayLength,
  checkStringArray,
  checkDefinedStringArray,
  checkDefinedString,
  checkJsonObject,
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

const normalizeSystem = function (system) {
  checkStringsObject(system, 'system')
}

const normalizeRunner = function (value, propName) {
  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, propName)
  checkArrayLength(valueA, propName)
  return { [propName]: valueA }
}

const normalizeTasks = function (value, propName) {
  if (value === undefined) {
    return
  }

  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, propName)
  return { [propName]: valueA }
}

const normalizeReporter = function (value, propName, { force }) {
  if (force) {
    return { [propName]: [] }
  }

  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, propName)
  return { [propName]: valueA }
}

const normalizeSelect = function (value, propName) {
  const valueA = normalizeOptionalArray(value)
  checkStringArray(valueA, propName)
  return { [propName]: valueA }
}

const normalizeLimit = function (value, propName) {
  if (value === undefined) {
    return
  }

  const valueA = parseLimit(value)
  return { [propName]: valueA }
}

const checkTitles = function (value, propName) {
  Object.entries(value).forEach(([childName, propValue]) => {
    checkDefinedString(propValue, `${propName}.${childName}`)
  })
}

const checkInputs = function (value, propName) {
  checkJsonObject(value, propName)
}

const NORMALIZERS = {
  precision: normalizePrecision,
  system: normalizeSystem,
  runner: normalizeRunner,
  tasks: normalizeTasks,
  reporter: normalizeReporter,
  select: normalizeSelect,
  limit: normalizeLimit,
  merge: normalizeMerge,
  titles: checkTitles,
  inputs: checkInputs,
}
