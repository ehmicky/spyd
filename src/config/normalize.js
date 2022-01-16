import mapObj from 'map-obj'

import { normalizeLimit } from '../history/compare/normalize.js'
import { normalizeDelta } from '../history/delta/normalize.js'
import { validateMerge } from '../history/merge/id.js'
import { isOutputPath } from '../report/output.js'
import { normalizePrecision } from '../run/precision.js'
import {
  condition,
  composeNormalizers,
  runNormalizer,
} from '../utils/functional.js'

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
  const normalizer = NORMALIZERS[propName]
  return normalizer === undefined
    ? value
    : runNormalizer(normalizer, value, name, configInfos)
}

// TODO: missing `reporterConfig`, `runnerConfig`
const NORMALIZERS = {
  colors: checkBoolean,
  cwd: composeNormalizers(checkDefinedString, normalizeConfigPath),
  delta: normalizeDelta,
  force: checkBoolean,
  inputs: cCheckObjectProps([checkJson]),
  limit: composeNormalizers(checkInteger, normalizeLimit),
  merge: composeNormalizers(checkDefinedString, validateMerge),
  output: composeNormalizers(
    checkDefinedString,
    condition(normalizeConfigPath, isOutputPath),
  ),
  outliers: checkBoolean,
  precision: composeNormalizers(checkInteger, normalizePrecision),
  quiet: checkBoolean,
  reporter: composeNormalizers(
    normalizeOptionalArray,
    cCheckArrayItems([checkDefinedString]),
  ),
  runner: composeNormalizers(
    normalizeOptionalArray,
    checkArrayLength,
    cCheckArrayItems([checkDefinedString]),
  ),
  save: checkBoolean,
  select: composeNormalizers(
    normalizeOptionalArray,
    cCheckArrayItems([checkString]),
  ),
  showDiff: checkBoolean,
  showMetadata: checkBoolean,
  showPrecision: checkBoolean,
  showSystem: checkBoolean,
  showTitles: checkBoolean,
  since: normalizeDelta,
  system: cCheckObjectProps([checkDefinedString]),
  tasks: composeNormalizers(
    normalizeOptionalArray,
    cCheckArrayItems([checkDefinedString, normalizeConfigGlob]),
  ),
  titles: cCheckObjectProps([checkDefinedString]),
}
