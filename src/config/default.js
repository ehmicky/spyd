import { isTtyInput, isTtyOutput } from '../report/tty.js'

// Add default configuration properties
export const addDefaultConfig = function ({
  config,
  command,
  envInfo: { isCi },
  processCwd,
}) {
  const defaultDelta = isCi ? 'ci' : 1
  return {
    ...DEFAULT_CONFIG,
    cwd: processCwd,
    quiet: !isTtyInput() || !isTtyOutput(),
    delta: defaultDelta,
    since: defaultDelta,
    showSystem: config.system !== undefined,
    showMetadata: METADATA_COMMANDS.has(command),
    ...config,
  }
}

const METADATA_COMMANDS = new Set(['show', 'remove'])

// We default `runner` to `node` only instead of several ones (e.g. `cli`)
// because this enforces that the `runner` property points to a required tasks
// file, instead of to an optional one. This makes behavior easier to understand
// for users and provides with better error messages.
export const DEFAULT_CONFIG = {
  precision: 2,
  concurrency: 1,
  system: 'default_system',
  save: false,
  limit: [],
  titles: {},
  output: undefined,
  showTitles: false,
  showPrecision: false,
  include: [],
  exclude: [],
  runner: ['node'],
  reporter: ['debug'],
  inputs: {},
}
