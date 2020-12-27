export const id = 'cli'
export const title = 'CLI'
export const extensions = ['yml', 'yaml']
export const system = {}
export const repeat = false

export const commands = function () {
  return [{ spawn: ['node', START_PATH], versions: [] }]
}

const START_PATH = `${__dirname}/start.js`
