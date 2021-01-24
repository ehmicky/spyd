import { validateConfig } from './validate.js'

export const launch = function (runnerConfig) {
  validateConfig(runnerConfig)
  return { spawn: ['node', MAIN_PATH], versions: {} }
}

const MAIN_PATH = `${__dirname}/main.js`
