const START_PATH = `${__dirname}/start.js`

const commands = function () {
  return [{ spawn: ['node', START_PATH], versions: [] }]
}

export const cli = {
  id: 'cli',
  title: 'CLI',
  extensions: ['yml', 'yaml'],
  commands,
  system: {},
}
