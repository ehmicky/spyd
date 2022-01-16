import mapObj from 'map-obj'

import { normalizeLimit } from '../history/compare/normalize.js'
import { normalizeDelta } from '../history/delta/normalize.js'
import { validateMerge } from '../history/merge/id.js'
import { normalizePrecision } from '../run/precision.js'

import {
  checkBoolean,
  checkInteger,
  checkString,
  normalizeOptionalArray,
  checkArrayItems,
  checkArrayLength,
  checkObjectProps,
  checkDefinedString,
  checkJson,
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

const NORMALIZERS = {
  colors: [checkBoolean],
  cwd: [checkString, checkDefinedString],
  delta: [normalizeDelta],
  inputs: [checkObjectProps.bind(undefined, [checkJson])],
  limit: [checkInteger, normalizeLimit],
  merge: [validateMerge],
  outliers: [checkBoolean],
  precision: [checkInteger, normalizePrecision],
  reporter: [
    normalizeOptionalArray,
    checkArrayItems.bind(undefined, [checkString, checkDefinedString]),
  ],
  runner: [
    normalizeOptionalArray,
    checkArrayLength,
    checkArrayItems.bind(undefined, [checkString, checkDefinedString]),
  ],
  select: [
    normalizeOptionalArray,
    checkArrayItems.bind(undefined, [checkString]),
  ],
  showDiff: [checkBoolean],
  showPrecision: [checkBoolean],
  showTitles: [checkBoolean],
  since: [normalizeDelta],
  system: [checkObjectProps.bind(undefined, [checkString])],
  tasks: [
    normalizeOptionalArray,
    checkArrayItems.bind(undefined, [checkString, checkDefinedString]),
  ],
  titles: [checkObjectProps.bind(undefined, [checkString, checkDefinedString])],
}
