import { normalizeRunConfig } from './config.js'
import { getNodeVersion } from './version.js'

const MAIN_PATH = `${__dirname}/main.js`

// Retrieve Node commands. By default it uses the current Node.js.
// But the `run_node_versions` can be used to spawn several Node.js versions.
export const launch = async function (runConfig) {
  const runConfigA = normalizeRunConfig(runConfig)

  const versionInfo = await getNodeVersion(runConfigA)

  if (versionInfo === undefined) {
    return {
      spawn: ['node', MAIN_PATH],
      versions: [{ value: ['node', '--version'] }],
    }
  }

  const { command, spawnOptions, versionRange, version } = versionInfo
  const versions = versionRange === version ? [] : [{ value: version }]
  return {
    id: versionRange,
    title: versionRange,
    spawn: [command, MAIN_PATH],
    spawnOptions,
    versions,
  }
}
