import { getOpts } from './options.js'

export const action = function(runOpts) {
  const runOptsA = getOpts(runOpts)

  return {
    commands: [{ value: ['node', `${__dirname}/start.js`] }],
    versions: [{ title: 'Node', value: ['node', '--version'] }],
  }
}
