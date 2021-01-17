export const id = 'cli'
export const title = 'CLI'

export const launch = function () {
  return { spawn: ['node', MAIN_PATH] }
}

const MAIN_PATH = `${__dirname}/main.js`
