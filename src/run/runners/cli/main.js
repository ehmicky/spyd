const START_PATH = `${__dirname}/start.js`

const action = function() {
  return [{ value: ['node', START_PATH], versions: [] }]
}

export const cli = {
  id: 'cli',
  title: 'CLI',
  extensions: ['yml', 'yaml'],
  action,
  system: {},
}
