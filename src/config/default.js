import { cwd as getCwd } from 'process'

import isPlainObj from 'is-plain-obj'

import { getDefaultId } from '../history/merge/id.js'
import { isTtyInput } from '../report/tty.js'
import { cleanObject } from '../utils/clean.js'

// Add default configuration properties
export const addDefaultConfig = function (config, command) {
  const defaultConfig = getDefaultConfig(config, command)
  const forcedConfig = getForcedConfig(config)
  return cleanObject({ ...defaultConfig, ...config, ...forcedConfig })
}

const getDefaultConfig = function (config, command) {
  return {
    ...DEFAULT_CONFIG,
    cwd: getCwd(),
    force: !isTtyInput(),
    merge: getDefaultId(),
    showMetadata: METADATA_COMMANDS.has(command),
    showSystem: getDefaultShowSystem(config),
  }
}

const getDefaultShowSystem = function ({ system = {} }) {
  return isPlainObj(system) && Object.keys(system).length !== 0
}

const METADATA_COMMANDS = new Set(['show', 'remove'])

// We default `runner` to `node` only instead of several ones (e.g. `cli`)
// because this enforces that the `runner` property points to a required tasks
// file, instead of to an optional one. This makes behavior easier to understand
// for users and provides with better error messages.
export const DEFAULT_CONFIG = {
  delta: 1,
  inputs: {},
  outliers: false,
  precision: 5,
  reporter: ['debug'],
  reporterConfig: {},
  runner: ['node'],
  runnerConfig: {},
  save: false,
  select: [],
  showPrecision: false,
  showTitles: false,
  since: 1,
  system: {},
  titles: {},
}

// Configuration properties which cannot be overridden
const getForcedConfig = function ({ force, reporter }) {
  return {
    reporter: force ? [] : reporter,
  }
}
