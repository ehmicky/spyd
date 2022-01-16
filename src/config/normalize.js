import mapObj from 'map-obj'

import { normalizeLimit } from '../history/compare/normalize.js'
import { validateMerge } from '../history/merge/id.js'
import { normalizePrecision } from '../run/precision.js'

import {
  checkBoolean,
  checkStringsObject,
  normalizeOptionalArray,
  checkArrayLength,
  checkStringArray,
  checkDefinedStringArray,
  checkDefinedString,
  checkJsonObject,
} from './check.js'
import { validateConfigSelector, isConfigSelector } from './select/normalize.js'

// Normalize configuration shape and do custom validation
export const normalizeConfig = function (config) {
  return mapObj(config, normalizePropEntry)
}

const normalizePropEntry = function (propName, value) {
  const valueA = normalizePropDeep(value, propName)
  return [propName, valueA]
}

// If a configuration property uses selectors or variations, normalization must
// be applied recursively.
const normalizePropDeep = function (value, propName) {
  if (!isDeepProp(value, propName)) {
    return normalizePropValue(value, propName, propName)
  }

  validateConfigSelector(value, propName)

  return mapObj(value, (selector, childValue) => [
    selector,
    normalizePropValue(childValue, propName, `${propName}.${selector}`),
  ])
}

const isDeepProp = function (configValue, propName) {
  return isConfigSelector(configValue, propName)
}

const normalizePropValue = function (value, propName, name) {
  const normalizers = NORMALIZERS[propName]

  if (normalizers === undefined) {
    return value
  }

  const newValue = normalizers.reduce(
    (valueA, normalizer) => normalizer(valueA, name),
    value,
  )
  return newValue === undefined ? value : newValue
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
  inputs: [checkJsonObject],
  limit: [normalizeLimit],
  merge: [validateMerge],
  outliers: [checkBoolean],
  precision: [normalizePrecision],
  reporter: [normalizeReporter],
  runner: [normalizeRunner],
  select: [normalizeSelect],
  showDiff: [checkBoolean],
  showPrecision: [checkBoolean],
  showTitles: [checkBoolean],
  system: [checkStringsObject],
  tasks: [normalizeTasks],
  titles: [validateTitles],
}
