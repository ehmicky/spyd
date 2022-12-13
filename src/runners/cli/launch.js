import { fileURLToPath } from 'node:url'

const HANDLER_MAIN_PATH = fileURLToPath(
  new URL('handler/main.js', import.meta.url),
)

export const launch = ({ shell }) => ({
  spawn: ['node', HANDLER_MAIN_PATH],
  versions: SHELL_VERSIONS[shell],
})

const SHELL_VERSIONS = {
  none: {},
  sh: {},
  bash: { Bash: ['bash', '-c', 'echo $BASH_VERSION'] },
}
