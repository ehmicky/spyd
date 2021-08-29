import { fileURLToPath } from 'url'

import { validateConfig } from './validate.js'

const HANDLER_MAIN_PATH = fileURLToPath(new URL('handler.js', import.meta.url))

export const launch = function (runnerConfig) {
  validateConfig(runnerConfig)
  const versions = getVersions(runnerConfig)
  return { spawn: ['node', HANDLER_MAIN_PATH], versions }
}

const getVersions = function ({ shell = 'none' }) {
  return SHELL_VERSIONS[shell]
}

const SHELL_VERSIONS = {
  none: {},
  sh: {},
  bash: { Bash: ['bash', '-c', 'echo $BASH_VERSION'] },
}
