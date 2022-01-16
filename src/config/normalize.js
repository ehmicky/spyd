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
import { cRecurseConfigSelectors } from './select/normalize.js'

// Normalize configuration shape and do custom validation
export const normalizeConfig = function (config, configInfos) {
  // eslint-disable-next-line fp/no-mutating-methods
  const configInfosA = [...configInfos].reverse()
  return mapObj(config, (name, value) => [
    name,
    normalizePropValue(value, name, configInfosA),
  ])
}

const normalizePropValue = function (value, name, configInfos) {
  const normalizer = NORMALIZERS[name]
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
  limit: cRecurseConfigSelectors(
    composeNormalizers(checkInteger, normalizeLimit),
  ),
  merge: composeNormalizers(checkDefinedString, validateMerge),
  output: composeNormalizers(
    checkDefinedString,
    condition(normalizeConfigPath, isOutputPath),
  ),
  outliers: cRecurseConfigSelectors(checkBoolean),
  precision: cRecurseConfigSelectors(
    composeNormalizers(checkInteger, normalizePrecision),
  ),
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
  showDiff: cRecurseConfigSelectors(checkBoolean),
  showMetadata: checkBoolean,
  showPrecision: cRecurseConfigSelectors(checkBoolean),
  showSystem: checkBoolean,
  showTitles: cRecurseConfigSelectors(checkBoolean),
  since: normalizeDelta,
  system: cCheckObjectProps([checkDefinedString]),
  tasks: composeNormalizers(
    normalizeOptionalArray,
    cCheckArrayItems([checkDefinedString, normalizeConfigGlob]),
  ),
  titles: cCheckObjectProps([checkDefinedString]),
}
