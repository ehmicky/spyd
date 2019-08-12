const extensions = ['js', 'ts', 'jsx', 'tsx', 'es6', 'mjs']

const action = function() {
  return {
    commands: [{ value: ['node', `${__dirname}/start.js`] }],
    versions: [{ title: 'Node', value: ['node', '--version'] }],
  }
}

export const node = { id: 'node', title: 'Node', extensions, action }
