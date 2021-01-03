import { getDefaultMergeId } from '../merge/config.js'

// Add default configuration properties
export const addDefaultConfig = function (config, action) {
  return {
    ...DEFAULT_CONFIG,
    context: action === 'show',
    merge: getDefaultMergeId({ ...DEFAULT_CONFIG, ...config }),
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
  diff: true,
  exclude: [],
  tasks: {},
  runner: {},
  reporters: ['debug'],
  reporter: {},
  progresses: ['debug'],
  progress: {},
  stores: ['file'],
  store: {},
  titles: {},
  input: {},
}
