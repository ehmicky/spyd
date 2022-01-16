/* eslint-disable max-lines */
import { cwd as getCwd } from 'process'

import { normalizeLimit } from '../../history/compare/normalize.js'
import { normalizeDelta } from '../../history/delta/normalize.js'
import { getDefaultId, validateMerge } from '../../history/merge/id.js'
import { isOutputPath } from '../../report/output.js'
import { isTtyInput } from '../../report/tty.js'
import { normalizePrecision } from '../../run/precision.js'
import { getDefaultConfig } from '../load/default.js'
import { recurseConfigSelectors } from '../select/normalize.js'

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
// eslint-disable-next-line import/max-dependencies
import { normalizeConfigPath, normalizeConfigGlob } from './path.js'

const METADATA_COMMANDS = new Set(['show', 'remove'])

export const CONFIG_PROPS = {
  config: {
    commands: 'all',
    async default() {
      return await getDefaultConfig()
    },
    normalize(value, name) {
      const valueA = normalizeOptionalArray(value)
      checkArrayItems(valueA, name, checkDefinedString)
      return valueA
    },
  },
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
      checkObjectProps(value, name, checkJson)
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
      recurseConfigSelectors(value, name, checkBoolean)
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
    async normalize(value, name, { config: { force } }) {
      if (await force) {
        return []
      }

      const valueA = normalizeOptionalArray(value)
      checkArrayItems(valueA, name, checkDefinedString)
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
      checkArrayItems(valueA, name, checkDefinedString)
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
      checkArrayItems(valueA, name, checkString)
      return valueA
    },
  },
  showDiff: {
    commands: 'report',
    normalize(value, name) {
      recurseConfigSelectors(value, name, checkBoolean)
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
      recurseConfigSelectors(value, name, checkBoolean)
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
      recurseConfigSelectors(value, name, checkBoolean)
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
      checkObjectProps(value, name, checkDefinedString)
    },
  },
  tasks: {
    commands: 'combinations',
    normalize(value, name, { configInfos }) {
      const valueA = normalizeOptionalArray(value)
      return checkArrayItems(valueA, name, (childValue, childName) => {
        checkDefinedString(childValue, childName)
        return normalizeConfigGlob(childValue, childName, configInfos)
      })
    },
  },
  titles: {
    commands: 'report',
    default: {},
    normalize(value, name) {
      checkObjectProps(value, name, checkDefinedString)
    },
  },
}
/* eslint-enable max-lines */
