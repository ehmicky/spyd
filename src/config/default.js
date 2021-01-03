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
  output: '-',
  delta: true,
  diff: true,
  info: false,
  limit: [],
  tasks: {},
  runner: {},
  reporters: ['debug'],
  report: {},
  progresses: ['debug'],
  progress: {},
  stores: ['file'],
  store: {},
  save: false,
  system: '',
}
