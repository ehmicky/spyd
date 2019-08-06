const extensions = ['js', 'ts', 'jsx', 'tsx', 'es6', 'mjs']

const commands = function() {
  return [{ command: ['node', `${__dirname}/start.js`] }]
}

const versions = function() {
  return [{ title: 'Node', version: ['node', '--version'] }]
}

export const node = { id: 'node', extensions, commands, versions }
