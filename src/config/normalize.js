import mapObj from 'map-obj'

import { normalizeLimit } from '../history/compare/normalize.js'
import { normalizeDelta } from '../history/delta/normalize.js'
import { validateMerge } from '../history/merge/id.js'
import { isOutputPath } from '../report/output.js'
import { normalizePrecision } from '../run/precision.js'
import { condition } from '../utils/functional.js'

import {
  checkBoolean,
  checkInteger,
  checkString,
  normalizeOptionalArray,
  cCheckArrayItems,
  checkArrayLength,
  cCheckObjectProps,
  checkDefinedString,
  checkJson,
} from './check.js'
import { normalizeConfigPath, normalizeConfigGlob } from './path.js'
import { validateConfigSelector, isConfigSelector } from './select/normalize.js'

// Normalize configuration shape and do custom validation
export const normalizeConfig = function (config, configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return mapObj(config, (propName, value) => [
    propName,
    normalizePropDeep(value, propName, configInfosA),
  ])
}

// If a configuration property uses selectors or variations, normalization must
// be applied recursively.
const normalizePropDeep = function (value, propName, configInfos) {
  if (!isDeepProp(value, propName)) {
    return normalizePropValue({ value, propName, name: propName, configInfos })
  }

  validateConfigSelector(value, propName)

  return mapObj(value, (selector, childValue) => [
    selector,
    normalizePropValue({
      value: childValue,
      propName,
      name: `${propName}.${selector}`,
      configInfos,
    }),
  ])
}

const isDeepProp = function (configValue, propName) {
  return isConfigSelector(configValue, propName)
}

const normalizePropValue = function ({ value, propName, name, configInfos }) {
  const normalizers = NORMALIZERS[propName]

  if (normalizers === undefined) {
    return value
  }

  return normalizers.reduce(
    (valueA, normalizer) =>
      applyNormalizer({ value: valueA, name, normalizer, configInfos }),
    value,
  )
}

const applyNormalizer = function ({ value, name, normalizer, configInfos }) {
  const newValue = normalizer(value, name, configInfos)
  return newValue === undefined ? value : newValue
}

// TODO: missing `reporterConfig`, `runnerConfig`
const NORMALIZERS = {
  colors: [checkBoolean],
  cwd: [checkDefinedString, normalizeConfigPath],
  delta: [normalizeDelta],
  force: [checkBoolean],
  inputs: [cCheckObjectProps([checkJson])],
  limit: [checkInteger, normalizeLimit],
  merge: [checkDefinedString, validateMerge],
  output: [checkDefinedString, condition(normalizeConfigPath, isOutputPath)],
  outliers: [checkBoolean],
  precision: [checkInteger, normalizePrecision],
  quiet: [checkBoolean],
  reporter: [normalizeOptionalArray, cCheckArrayItems([checkDefinedString])],
  runner: [
    normalizeOptionalArray,
    checkArrayLength,
    cCheckArrayItems([checkDefinedString]),
  ],
  save: [checkBoolean],
  select: [normalizeOptionalArray, cCheckArrayItems([checkString])],
  showDiff: [checkBoolean],
  showMetadata: [checkBoolean],
  showPrecision: [checkBoolean],
  showSystem: [checkBoolean],
  showTitles: [checkBoolean],
  since: [normalizeDelta],
  system: [cCheckObjectProps([checkDefinedString])],
  tasks: [
    normalizeOptionalArray,
    cCheckArrayItems([checkDefinedString, normalizeConfigGlob]),
  ],
  titles: [cCheckObjectProps([checkDefinedString])],
}
