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
  return Object.entries(CONFIG_PROPS).reduce(
    (configA, [name, configProp]) =>
      normalizePropConfig(
        { config: configA, name, configInfos: configInfosA },
        configProp,
      ),
    config,
  )
}

const normalizePropConfig = function (
  { config, name, configInfos },
  { normalize },
) {
  const value = config[name]

  if (value === undefined) {
    return config
  }

  const newValue =
    normalize === undefined
      ? value
      : runNormalizer(normalize, value, name, configInfos)
  return { ...config, [name]: newValue }
}

const CONFIG_PROPS = {
  colors: {
    normalize: checkBoolean,
  },
  cwd: {
    normalize: composeNormalizers(checkDefinedString, normalizeConfigPath),
  },
  delta: {
    normalize: normalizeDelta,
  },
  force: {
    normalize: checkBoolean,
  },
  inputs: {
    normalize: cCheckObjectProps(checkJson),
  },
  limit: {
    normalize: cRecurseConfigSelectors(
      composeNormalizers(checkInteger, normalizeLimit),
    ),
  },
  merge: {
    normalize: composeNormalizers(checkDefinedString, validateMerge),
  },
  output: {
    normalize: composeNormalizers(
      checkDefinedString,
      condition(normalizeConfigPath, isOutputPath),
    ),
  },
  outliers: {
    normalize: cRecurseConfigSelectors(checkBoolean),
  },
  precision: {
    normalize: cRecurseConfigSelectors(
      composeNormalizers(checkInteger, normalizePrecision),
    ),
  },
  quiet: {
    normalize: checkBoolean,
  },
  reporter: {
    normalize: composeNormalizers(
      normalizeOptionalArray,
      cCheckArrayItems(checkDefinedString),
    ),
  },
  runner: {
    normalize: composeNormalizers(
      normalizeOptionalArray,
      checkArrayLength,
      cCheckArrayItems(checkDefinedString),
    ),
  },
  save: {
    normalize: checkBoolean,
  },
  select: {
    normalize: composeNormalizers(
      normalizeOptionalArray,
      cCheckArrayItems(checkString),
    ),
  },
  showDiff: {
    normalize: cRecurseConfigSelectors(checkBoolean),
  },
  showMetadata: {
    normalize: checkBoolean,
  },
  showPrecision: {
    normalize: cRecurseConfigSelectors(checkBoolean),
  },
  showSystem: {
    normalize: checkBoolean,
  },
  showTitles: {
    normalize: cRecurseConfigSelectors(checkBoolean),
  },
  since: {
    normalize: normalizeDelta,
  },
  system: {
    normalize: cCheckObjectProps(checkDefinedString),
  },
  tasks: {
    normalize: composeNormalizers(
      normalizeOptionalArray,
      cCheckArrayItems(
        composeNormalizers(checkDefinedString, normalizeConfigGlob),
      ),
    ),
  },
  titles: {
    normalize: cCheckObjectProps(checkDefinedString),
  },
}
