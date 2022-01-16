import mapObj from 'map-obj'

import { normalizeLimit } from '../history/compare/normalize.js'
import { validateMerge } from '../history/merge/id.js'
import { normalizePrecision } from '../run/precision.js'

import {
  checkBoolean,
  checkInteger,
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

  return normalizers.reduce(
    (valueA, normalizer) => applyNormalizer(valueA, name, normalizer),
    value,
  )
}

const applyNormalizer = function (value, name, normalizer) {
  const newValue = normalizer(value, name)
  return newValue === undefined ? value : newValue
}

const validateTitles = function (value, name) {
  Object.entries(value).forEach(([childName, propValue]) => {
    checkDefinedString(propValue, `${name}.${childName}`)
  })
}

const NORMALIZERS = {
  inputs: [checkJsonObject],
  limit: [checkInteger, normalizeLimit],
  merge: [validateMerge],
  outliers: [checkBoolean],
  precision: [checkInteger, normalizePrecision],
  reporter: [normalizeOptionalArray, checkDefinedStringArray],
  runner: [normalizeOptionalArray, checkDefinedStringArray, checkArrayLength],
  select: [normalizeOptionalArray, checkStringArray],
  showDiff: [checkBoolean],
  showPrecision: [checkBoolean],
  showTitles: [checkBoolean],
  system: [checkStringsObject],
  tasks: [normalizeOptionalArray, checkDefinedStringArray],
  titles: [validateTitles],
}
