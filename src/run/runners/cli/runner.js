export const id = 'cli'
export const title = 'CLI'
export const extensions = ['yml', 'yaml']
export const system = {}
export const repeat = false

export const launch = function () {
  return [{ spawn: ['node', MAIN_PATH], versions: [] }]
}

const MAIN_PATH = `${__dirname}/main.js`
