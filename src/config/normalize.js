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

// TODO: missing `config`, `reporterConfig`, `runnerConfig`
const NORMALIZERS = {
  colors: [checkBoolean],
  cwd: [checkDefinedString],
  delta: [normalizeDelta],
  force: [checkBoolean],
  inputs: [checkObjectProps.bind(undefined, [checkJson])],
  limit: [checkInteger, normalizeLimit],
  merge: [checkDefinedString, validateMerge],
  output: [checkDefinedString],
  outliers: [checkBoolean],
  precision: [checkInteger, normalizePrecision],
  quiet: [checkBoolean],
  reporter: [
    normalizeOptionalArray,
    checkArrayItems.bind(undefined, [checkDefinedString]),
  ],
  runner: [
    normalizeOptionalArray,
    checkArrayLength,
    checkArrayItems.bind(undefined, [checkDefinedString]),
  ],
  save: [checkBoolean],
  select: [
    normalizeOptionalArray,
    checkArrayItems.bind(undefined, [checkString]),
  ],
  showDiff: [checkBoolean],
  showMetadata: [checkBoolean],
  showPrecision: [checkBoolean],
  showSystem: [checkBoolean],
  showTitles: [checkBoolean],
  since: [normalizeDelta],
  system: [checkObjectProps.bind(undefined, [checkDefinedString])],
  tasks: [
    normalizeOptionalArray,
    checkArrayItems.bind(undefined, [checkDefinedString]),
  ],
  titles: [checkObjectProps.bind(undefined, [checkDefinedString])],
}
