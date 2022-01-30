import { version as currentVersion } from 'process'
import { fileURLToPath } from 'url'

import { getNodeVersion } from './version.js'

const HANDLER_MAIN_PATH = fileURLToPath(
  new URL('../handler/main.js', import.meta.url),
)

// Retrieve Node commands. By default it uses the current Node.js.
// But `runnerConfig.node.version` can be used to spawn a different Node.js
// version.
export const launch = async function (runnerConfig) {
  const versionInfo = await getNodeVersion(runnerConfig)

  if (versionInfo === undefined) {
    return {
      spawn: ['node', HANDLER_MAIN_PATH],
      versions: { Node: currentVersion.slice(1) },
    }
  }

  const { command, spawnOptions, version } = versionInfo
  return {
    spawn: [command, HANDLER_MAIN_PATH],
    spawnOptions,
    versions: { Node: version },
  }
}
