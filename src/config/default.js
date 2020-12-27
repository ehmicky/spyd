import { stderr } from 'process'

import isInteractive from 'is-interactive'

import { getDefaultMergeId } from '../merge/config.js'

// Add default configuration properties
export const addDefaultConfig = function (config, action) {
  return {
    ...DEFAULT_CONFIG,
    context: action === 'show',
    duration: getDefaultDuration(),
    merge: getDefaultMergeId({ ...DEFAULT_CONFIG, ...config }),
    ...config,
  }
}

const getDefaultDuration = function () {
  return isInteractive(stderr) ? -1 : 0
}

export const DEFAULT_CONFIG = {
  output: '-',
  delta: true,
  diff: true,
  info: false,
  limit: [],
  progress: { debug: {} },
  report: { debug: {} },
  run: { node: {} },
  save: false,
  store: { file: {} },
  system: '',
}
