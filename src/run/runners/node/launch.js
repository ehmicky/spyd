import { version as currentVersion } from 'process'

import { validate, multipleValidOptions } from 'jest-validate'

import { getNodeVersion } from './version.js'

const MAIN_PATH = `${__dirname}/main.js`

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

// Validate runnerConfig
const validateConfig = function (runnerConfig) {
  validate(runnerConfig, { exampleConfig: EXAMPLE_CONFIG })
}

const EXAMPLE_CONFIG = {
  tasks: 'tasks.js',
  // eslint-disable-next-line no-magic-numbers
  version: multipleValidOptions('12', 12),
}
