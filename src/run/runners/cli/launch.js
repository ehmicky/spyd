import { validateShell } from './shell.js'

export const launch = function ({ shell }) {
  validateShell(shell)
  return { spawn: ['node', MAIN_PATH], versions: {} }
}

const MAIN_PATH = `${__dirname}/main.js`
