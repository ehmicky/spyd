import { getOpts } from './options.js'
import { getNodeVersions } from './versions.js'

export const action = async function(runOpts) {
  const runOptsA = getOpts(runOpts)

  const nodeVersions = await getNodeVersions(runOptsA)

  return {
    commands: [{ value: ['node', `${__dirname}/start.js`] }],
    versions: [{ title: 'Node', value: ['node', '--version'] }],
  }
}
