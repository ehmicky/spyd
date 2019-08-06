const extensions = ['js', 'ts', 'jsx', 'tsx', 'es6', 'mjs']

const commands = function() {
  return [{ command: ['node', `${__dirname}/start.js`] }]
}

export const node = { id: 'node', extensions, commands }
