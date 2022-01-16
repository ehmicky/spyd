import mapObj from 'map-obj'

import { normalizeLimit } from '../history/compare/normalize.js'
import { validateMerge } from '../history/merge/id.js'
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
  return mapObj(config, normalizePropEntry)
}

const normalizePropEntry = function (name, value) {
  const valueA = normalizePropValue(value, name)
  return [name, valueA]
}

const normalizePropValue = function (value, name) {
  const normalizer = NORMALIZERS[name]

  if (normalizer === undefined) {
    return value
  }

  const newValue = normalizer(value, name)
  return newValue === undefined ? value : newValue
}

const normalizeSystem = function (system) {
  checkStringsObject(system, 'system')
}

const normalizeRunner = function (value, propName) {
  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, propName)
  checkArrayLength(valueA, propName)
  return valueA
}

const normalizeTasks = function (value, propName) {
  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, propName)
  return valueA
}

const normalizeReporter = function (value, propName) {
  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, propName)
  return valueA
}

const normalizeSelect = function (value, propName) {
  const valueA = normalizeOptionalArray(value)
  checkStringArray(valueA, propName)
  return valueA
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
  merge: validateMerge,
  titles: checkTitles,
  inputs: checkInputs,
}
