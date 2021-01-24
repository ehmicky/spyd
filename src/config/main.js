import { cwd as getCwd } from 'process'

import envCi from 'env-ci'

import { addPlugins } from '../plugin/add.js'

import { addDefaultConfig } from './default.js'
import { loadConfig } from './load.js'
import { normalizeConfig } from './normalize.js'
import { validateConfig } from './validate.js'

// Retrieve configuration
// `cwd` and `config` cannot be specified in the configuration file
// When resolving configuration relative file paths, the CLI and programmatic
// flags use the current directory. However, in `spyd.*`, we use the
// configuration file's directory. We do this since this is probably what users
// would expect.
export const getConfig = async function (
  command,
  { cwd = getCwd(), ...configFlags } = {},
) {
  const config = await loadConfig(configFlags, cwd)

  validateConfig(config)
  const envInfo = envCi({ cwd })
  const configA = addDefaultConfig(config, command, envInfo)

  const configB = { ...configA, cwd, envInfo }
  const configC = normalizeConfig(configB)
  const configD = await addPlugins(configC)
  return configD
}
