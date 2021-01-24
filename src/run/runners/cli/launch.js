export const launch = function () {
  return { spawn: ['node', MAIN_PATH], versions: {} }
}

const MAIN_PATH = `${__dirname}/main.js`
