import { stderr } from 'process'

import isInteractive from 'is-interactive'

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
    quiet: !isInteractive(stderr),
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
  duration: 1,
  concurrency: 1,
  system: 'default_system',
  save: false,
  limit: [],
  titles: {},
  insert: '',
  showTitles: false,
  include: [],
  exclude: [],
  runner: ['node'],
  reporter: ['debug'],
  store: ['file'],
  inputs: {},
}
