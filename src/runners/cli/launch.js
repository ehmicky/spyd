import { fileURLToPath } from 'url'

import { validateConfig } from './validate.js'

export const launch = function (runnerConfig) {
  validateConfig(runnerConfig)
  const versions = getVersions(runnerConfig)
  return { spawn: ['node', MAIN_PATH], versions }
}

const MAIN_PATH = fileURLToPath(new URL('events.js', import.meta.url))

const getVersions = function ({ shell = 'none' }) {
  return SHELL_VERSIONS[shell]
}

const SHELL_VERSIONS = {
  none: {},
  sh: {},
  bash: { Bash: ['bash', '-c', 'echo $BASH_VERSION'] },
}
