import { getOpts } from './options.js'
import { getNodeVersions } from './versions.js'

export const action = async function(runOpts) {
  const runOptsA = getOpts(runOpts)

  const { versions, versionString } = await getNodeVersions(runOptsA)

  if (versions === undefined) {
    return {
      commands: [{ value: ['node', `${__dirname}/start.js`] }],
      versions: [{ title: 'Node', value: ['node', '--version'] }],
    }
  }

  const commands = versions.map(version => getNodeCommand(version, versions))
  return { commands, versions: [{ title: 'Node', value: versionString }] }
}

const getNodeCommand = function(version, versions) {
  const title = versions.length === 1 ? 'Node' : `Node ${version}`
  return { title, value: ['node', `${__dirname}/start.js`] }
}
