const START_PATH = `${__dirname}/start.js`
const extensions = ['yml', 'yaml']

const action = function() {
  return [{ value: ['node', START_PATH], versions: [] }]
}

export const cli = { id: 'cli', title: 'CLI', extensions, action, system: {} }
