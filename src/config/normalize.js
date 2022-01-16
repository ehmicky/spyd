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

const validateInputs = function (value, name) {
  checkJsonObject(value, name)
}

const normalizeReporter = function (value, name) {
  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, name)
  return valueA
}

const normalizeRunner = function (value, name) {
  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, name)
  checkArrayLength(valueA, name)
  return valueA
}

const normalizeSelect = function (value, name) {
  const valueA = normalizeOptionalArray(value)
  checkStringArray(valueA, name)
  return valueA
}

const validateSystem = function (system) {
  checkStringsObject(system, 'system')
}

const normalizeTasks = function (value, name) {
  const valueA = normalizeOptionalArray(value)
  checkDefinedStringArray(valueA, name)
  return valueA
}

const validateTitles = function (value, name) {
  Object.entries(value).forEach(([childName, propValue]) => {
    checkDefinedString(propValue, `${name}.${childName}`)
  })
}

const NORMALIZERS = {
  inputs: validateInputs,
  limit: normalizeLimit,
  merge: validateMerge,
  precision: normalizePrecision,
  reporter: normalizeReporter,
  runner: normalizeRunner,
  select: normalizeSelect,
  system: validateSystem,
  tasks: normalizeTasks,
  titles: validateTitles,
}
