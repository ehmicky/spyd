import { version as currentVersion } from 'process'
import { fileURLToPath } from 'url'

const HANDLER_MAIN_PATH = fileURLToPath(
  new URL('./handler/main.js', import.meta.url),
)

// `runnerConfig.node.version` can be used to spawn a different Node.js version
// than the current one.
export const launch = function ({ version }) {
  return version === undefined
    ? {
        spawn: ['node', HANDLER_MAIN_PATH],
        versions: { Node: currentVersion.slice(1) },
      }
    : {
        spawn: [version.command, HANDLER_MAIN_PATH],
        spawnOptions: version.execaOptions,
        versions: { Node: version.version },
      }
}