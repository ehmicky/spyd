// Add default configuration properties
export const addDefaultConfig = function (config, command) {
  return {
    ...DEFAULT_CONFIG,
    showSystem: config.system !== undefined,
    showMetadata: METADATA_COMMANDS.has(command),
    ...config,
  }
}

const METADATA_COMMANDS = new Set(['show', 'remove'])

export const DEFAULT_CONFIG = {
  duration: 1,
  concurrency: 1,
  system: 'default_system',
  save: false,
  output: '-',
  limit: [],
  titles: {},
  showTitles: false,
  showSystem: false,
  delta: 1,
  compare: 1,
  include: [],
  exclude: [],
  reporter: ['debug'],
  progress: ['debug'],
  store: ['file'],
  inputs: {},
}
