const START_PATH = `${__dirname}/start.js`
const extensions = ['js', 'ts', 'jsx', 'tsx', 'es6', 'mjs']

const action = function() {
  return [{ value: ['node', START_PATH], versions: [] }]
}

export const cli = { id: 'cli', title: 'CLI', extensions, action, system: {} }
