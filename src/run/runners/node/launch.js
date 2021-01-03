import { version as currentVersion } from 'process'

import { normalizeRunConfig } from './config.js'
import { getNodeVersion } from './version.js'

const MAIN_PATH = `${__dirname}/main.js`

// Retrieve Node commands. By default it uses the current Node.js.
// But `runner.node.version` can be used to spawn a different Node.js version.
export const launch = async function (runConfig) {
  const runConfigA = normalizeRunConfig(runConfig)

  const versionInfo = await getNodeVersion(runConfigA)

  if (versionInfo === undefined) {
    return { spawn: ['node', MAIN_PATH], versions: { Node: currentVersion } }
  }

  const { command, spawnOptions, version } = versionInfo
  return {
    spawn: [command, MAIN_PATH],
    spawnOptions,
    versions: { Node: version },
  }
}
