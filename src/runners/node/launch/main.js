import { version as currentVersion } from 'process'
import { fileURLToPath } from 'url'

import { validateConfig } from './validate.js'
import { getNodeVersion } from './version.js'

const MAIN_PATH = fileURLToPath(new URL('../events.js', import.meta.url))

// Retrieve Node commands. By default it uses the current Node.js.
// But `runnerNode.version` can be used to spawn a different Node.js version.
export const launch = async function (runnerConfig) {
  validateConfig(runnerConfig)

  const versionInfo = await getNodeVersion(runnerConfig)

  if (versionInfo === undefined) {
    return {
      spawn: ['node', MAIN_PATH],
      versions: { Node: currentVersion.slice(1) },
    }
  }

  const { command, spawnOptions, version } = versionInfo
  return {
    spawn: [command, MAIN_PATH],
    spawnOptions,
    versions: { Node: version },
  }
}
