import { getOpts } from './options.js'
import { getNodeVersions } from './versions.js'

const START_PATH = `${__dirname}/start.js`

// Retrieve Node commands. By default it uses the current Node.js.
// But the `run.node.versions` can be used to spawn several Node.js versions.
export const commands = async function (runOpts) {
  const runOptsA = getOpts(runOpts)

  const versions = await getNodeVersions(runOptsA)

  if (versions === undefined) {
    return [
      {
        spawn: ['node', START_PATH],
        versions: [{ value: ['node', '--version'] }],
      },
    ]
  }

  return versions.map(getNodeCommand)
}

const getNodeCommand = function ({
  command,
  spawnOptions,
  versionRange,
  version,
}) {
  const versions = versionRange === version ? [] : [{ value: version }]
  return {
    id: versionRange,
    title: versionRange,
    spawn: [command, START_PATH],
    spawnOptions,
    versions,
  }
}
