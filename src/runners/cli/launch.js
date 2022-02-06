import { fileURLToPath } from 'url'

const HANDLER_MAIN_PATH = fileURLToPath(
  new URL('handler/main.js', import.meta.url),
)

export const launch = function ({ shell }) {
  return {
    spawn: ['node', HANDLER_MAIN_PATH],
    versions: SHELL_VERSIONS[shell],
  }
}

const SHELL_VERSIONS = {
  none: {},
  sh: {},
  bash: { Bash: ['bash', '-c', 'echo $BASH_VERSION'] },
}
