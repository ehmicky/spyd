/* eslint-disable max-lines */
import { normalizeLimit } from '../history/compare/normalize.js'
import { normalizeDelta } from '../history/delta/normalize.js'
import { validateMerge } from '../history/merge/id.js'
import { isOutputPath } from '../report/output.js'
import { normalizePrecision } from '../run/precision.js'
import { condition, composeNormalizers } from '../utils/functional.js'

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

export const CONFIG_PROPS = {
  colors: {
    commands: 'report',
    normalize: checkBoolean,
  },
  cwd: {
    commands: 'all',
    normalize: composeNormalizers(checkDefinedString, normalizeConfigPath),
  },
  delta: {
    commands: 'delta',
    normalize: normalizeDelta,
  },
  force: {
    commands: 'remove',
    normalize: checkBoolean,
  },
  inputs: {
    commands: 'combinations',
    normalize: cCheckObjectProps(checkJson),
  },
  limit: {
    commands: 'report',
    normalize: cRecurseConfigSelectors(
      composeNormalizers(checkInteger, normalizeLimit),
    ),
  },
  merge: {
    commands: 'run',
    normalize: composeNormalizers(checkDefinedString, validateMerge),
  },
  output: {
    commands: 'report',
    normalize: composeNormalizers(
      checkDefinedString,
      condition(normalizeConfigPath, isOutputPath),
    ),
  },
  outliers: {
    commands: 'run',
    normalize: cRecurseConfigSelectors(checkBoolean),
  },
  precision: {
    commands: 'run',
    normalize: cRecurseConfigSelectors(
      composeNormalizers(checkInteger, normalizePrecision),
    ),
  },
  quiet: {
    commands: 'run',
    normalize: checkBoolean,
  },
  reporter: {
    commands: 'report',
    normalize: composeNormalizers(
      normalizeOptionalArray,
      cCheckArrayItems(checkDefinedString),
    ),
  },
  reporterConfig: {
    commands: 'report',
  },
  runner: {
    commands: 'combinations',
    normalize: composeNormalizers(
      normalizeOptionalArray,
      checkArrayLength,
      cCheckArrayItems(checkDefinedString),
    ),
  },
  runnerConfig: {
    commands: 'combinations',
  },
  save: {
    commands: 'run',
    normalize: checkBoolean,
  },
  select: {
    commands: 'select',
    normalize: composeNormalizers(
      normalizeOptionalArray,
      cCheckArrayItems(checkString),
    ),
  },
  showDiff: {
    commands: 'report',
    normalize: cRecurseConfigSelectors(checkBoolean),
  },
  showMetadata: {
    commands: 'report',
    normalize: checkBoolean,
  },
  showPrecision: {
    commands: 'report',
    normalize: cRecurseConfigSelectors(checkBoolean),
  },
  showSystem: {
    commands: 'report',
    normalize: checkBoolean,
  },
  showTitles: {
    commands: 'report',
    normalize: cRecurseConfigSelectors(checkBoolean),
  },
  since: {
    commands: 'history',
    normalize: normalizeDelta,
  },
  system: {
    commands: 'combinations',
    normalize: cCheckObjectProps(checkDefinedString),
  },
  tasks: {
    commands: 'combinations',
    normalize: composeNormalizers(
      normalizeOptionalArray,
      cCheckArrayItems(
        composeNormalizers(checkDefinedString, normalizeConfigGlob),
      ),
    ),
  },
  titles: {
    commands: 'report',
    normalize: cCheckObjectProps(checkDefinedString),
  },
}
/* eslint-enable max-lines */
