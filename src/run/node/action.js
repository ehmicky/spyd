import { validateRunOpts } from './validate.js'

export const action = function(runOpts) {
  validateRunOpts(runOpts)

  return {
    commands: [{ value: ['node', `${__dirname}/start.js`] }],
    versions: [{ title: 'Node', value: ['node', '--version'] }],
  }
}
