import { cwd as getCwd } from 'process'

import isPlainObj from 'is-plain-obj'

import { isTtyInput } from '../report/tty.js'

// Add default configuration properties
export const addDefaultConfig = function (config, command) {
  return {
    ...DEFAULT_CONFIG,
    cwd: getCwd(),
    force: !isTtyInput(),
    showSystem: getDefaultShowSystem(config),
    showMetadata: METADATA_COMMANDS.has(command),
    ...config,
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
  precision: 5,
  system: {},
  save: false,
  outliers: false,
  runnerConfig: {},
  reporterConfig: {},
  limit: [],
  delta: 1,
  since: 1,
  titles: {},
  showTitles: false,
  showPrecision: false,
  select: [],
  runner: ['node'],
  reporter: ['debug'],
  inputs: {},
}
