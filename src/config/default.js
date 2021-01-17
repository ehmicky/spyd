// Add default configuration properties
export const addDefaultConfig = function (config, action) {
  return {
    ...DEFAULT_CONFIG,
    context: action === 'show',
    ...config,
  }
}

export const DEFAULT_CONFIG = {
  duration: 1,
  concurrency: 1,
  system: 'default_system',
  save: false,
  output: '-',
  limit: [],
  info: false,
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
