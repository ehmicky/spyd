/* eslint-disable max-lines */
import { cwd as getCwd } from 'process'

import { normalizeLimit } from '../history/compare/normalize.js'
import { normalizeDelta } from '../history/delta/normalize.js'
import { getDefaultId, validateMerge } from '../history/merge/id.js'
import { isOutputPath } from '../report/output.js'
import { isTtyInput } from '../report/tty.js'
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

const METADATA_COMMANDS = new Set(['show', 'remove'])

export const CONFIG_PROPS = {
  colors: {
    commands: 'report',
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  cwd: {
    commands: 'all',
    default() {
      return getCwd()
    },
    normalize(value, name, { configInfos }) {
      checkDefinedString(value, name)
      return normalizeConfigPath(value, name, configInfos)
    },
  },
  delta: {
    commands: 'delta',
    default: 1,
    normalize(value, name) {
      return normalizeDelta(value, name)
    },
  },
  force: {
    commands: 'remove',
    default() {
      return !isTtyInput()
    },
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  inputs: {
    commands: 'combinations',
    default: {},
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
    default() {
      return getDefaultId()
    },
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
    default: false,
    normalize(value, name) {
      recurseConfigSelectors(value, name, (childValue, childName) => {
        checkBoolean(childValue, childName)
      })
    },
  },
  precision: {
    commands: 'run',
    default: 5,
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
    default: ['debug'],
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
    default: {},
  },
  // We default `runner` to `node` only instead of several ones (e.g. `cli`)
  // because this enforces that the `runner` property points to a required tasks
  // file, instead of to an optional one. This makes behavior easier to
  // understand for users and provides with better error messages.
  runner: {
    commands: 'combinations',
    default: ['node'],
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
    default: {},
  },
  save: {
    commands: 'run',
    default: false,
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  select: {
    commands: 'select',
    default: [],
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
    default(name, { command }) {
      return METADATA_COMMANDS.has(command)
    },
    normalize(value, name) {
      checkBoolean(value, name)
    },
  },
  showPrecision: {
    commands: 'report',
    default: false,
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
    default: false,
    normalize(value, name) {
      recurseConfigSelectors(value, name, (childValue, childName) => {
        checkBoolean(childValue, childName)
      })
    },
  },
  since: {
    commands: 'history',
    default: 1,
    normalize(value, name) {
      return normalizeDelta(value, name)
    },
  },
  system: {
    commands: 'combinations',
    default: {},
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
    default: {},
    normalize(value, name) {
      checkObjectProps(value, name, (childValue, childName) => {
        checkDefinedString(childValue, childName)
      })
    },
  },
}
/* eslint-enable max-lines */
