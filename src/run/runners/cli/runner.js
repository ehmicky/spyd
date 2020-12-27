export const id = 'cli'
export const title = 'CLI'
export const extensions = ['yml', 'yaml']
export const repeat = false

export const launch = function () {
  return { spawn: ['node', MAIN_PATH] }
}

const MAIN_PATH = `${__dirname}/main.js`
