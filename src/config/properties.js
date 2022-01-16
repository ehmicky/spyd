/* eslint-disable max-lines */
import { normalizeLimit } from '../history/compare/normalize.js'
import { normalizeDelta } from '../history/delta/normalize.js'
import { validateMerge } from '../history/merge/id.js'
import { isOutputPath } from '../report/output.js'
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
import { normalizeConfigPath, normalizeConfigGlob } from './path.js'
import { recurseConfigSelectors } from './select/normalize.js'

export const CONFIG_PROPS = {
  colors: {
    commands: 'report',
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  cwd: {
    commands: 'all',
    normalize(value, name, { configInfos }) {
      checkDefinedString(value, name)
      return normalizeConfigPath(value, name, configInfos)
    },
  },
  delta: {
    commands: 'delta',
    normalize(value, name) {
      return normalizeDelta(value, name)
    },
  },
  force: {
    commands: 'remove',
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  inputs: {
    commands: 'combinations',
    normalize(value, name) {
      checkObjectProps(value, name, (childValue, childName) => {
        checkJson(childValue, childName)
      })
    },
  },
  limit: {
    commands: 'report',
    normalize(value, name) {
      return recurseConfigSelectors(value, name, (childValue, childName) => {
        checkInteger(childValue, childName)
        return normalizeLimit(childValue, childName)
      })
    },
  },
  merge: {
    commands: 'run',
    normalize(value, name) {
      checkDefinedString(value, name)
      validateMerge(value, name)
    },
  },
  output: {
    commands: 'report',
    normalize(value, name, { configInfos }) {
      checkDefinedString(value, name)
      return isOutputPath(value)
        ? normalizeConfigPath(value, name, configInfos)
        : value
    },
  },
  outliers: {
    commands: 'run',
    normalize(value, name) {
      recurseConfigSelectors(value, name, (childValue, childName) => {
        checkBoolean(childValue, childName)
      })
    },
  },
  precision: {
    commands: 'run',
    normalize(value, name) {
      return recurseConfigSelectors(value, name, (childValue, childName) => {
        checkInteger(childValue, childName)
        return normalizePrecision(childValue, childName)
      })
    },
  },
  quiet: {
    commands: 'run',
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  reporter: {
    commands: 'report',
    normalize(value, name, { config: { force } }) {
      if (force) {
        return []
      }

      const valueA = normalizeOptionalArray(value)
      checkArrayItems(valueA, name, (childValue, childName) => {
        checkDefinedString(childValue, childName)
      })
      return valueA
    },
  },
  reporterConfig: {
    commands: 'report',
  },
  runner: {
    commands: 'combinations',
    normalize(value, name) {
      const valueA = normalizeOptionalArray(value)
      checkArrayLength(valueA, name)
      checkArrayItems(valueA, name, (childValue, childName) => {
        checkDefinedString(childValue, childName)
      })
      return valueA
    },
  },
  runnerConfig: {
    commands: 'combinations',
  },
  save: {
    commands: 'run',
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  select: {
    commands: 'select',
    normalize(value, name) {
      const valueA = normalizeOptionalArray(value)
      checkArrayItems(valueA, name, (childValue, childName) => {
        checkString(childValue, childName)
      })
      return valueA
    },
  },
  showDiff: {
    commands: 'report',
    normalize(value, name) {
      recurseConfigSelectors(value, name, (childValue, childName) => {
        checkBoolean(childValue, childName)
      })
    },
  },
  showMetadata: {
    commands: 'report',
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  showPrecision: {
    commands: 'report',
    normalize(value, name) {
      recurseConfigSelectors(value, name, (childValue, childName) => {
        checkBoolean(childValue, childName)
      })
    },
  },
  showSystem: {
    commands: 'report',
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  showTitles: {
    commands: 'report',
    normalize(value, name) {
      recurseConfigSelectors(value, name, (childValue, childName) => {
        checkBoolean(childValue, childName)
      })
    },
  },
  since: {
    commands: 'history',
    normalize(value, name) {
      return normalizeDelta(value, name)
    },
  },
  system: {
    commands: 'combinations',
    normalize(value, name) {
      checkObjectProps(value, name, (childValue, childName) => {
        checkDefinedString(childValue, childName)
      })
    },
  },
  tasks: {
    commands: 'combinations',
    normalize(value, name, { configInfos }) {
      const valueA = normalizeOptionalArray(value)
      return checkArrayItems(valueA, name, (childValue, childName) => {
        checkDefinedString(childValue, childName)
        return normalizeConfigGlob(value, name, configInfos)
      })
    },
  },
  titles: {
    commands: 'report',
    normalize(value, name) {
      checkObjectProps(value, name, (childValue, childName) => {
        checkDefinedString(childValue, childName)
      })
    },
  },
}
/* eslint-enable max-lines */
