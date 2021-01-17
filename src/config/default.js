// Add default configuration properties
export const addDefaultConfig = function (config, action) {
  return {
    ...DEFAULT_CONFIG,
    showMetadata: METADATA_ACTIONS.has(action),
    ...config,
  }
}

const METADATA_ACTIONS = new Set(['show', 'remove'])

export const DEFAULT_CONFIG = {
  duration: 1,
  concurrency: 1,
  system: 'default_system',
  save: false,
  output: '-',
  limit: [],
  showSystem: false,
  delta: true,
  compare: 1,
  include: [],
  exclude: [],
  reporter: ['debug'],
  progress: ['debug'],
  store: ['file'],
  titles: {},
  inputs: {},
}
