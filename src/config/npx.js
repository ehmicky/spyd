import { env } from 'process'

import { CONFIG_PLUGIN_TYPE } from '../plugin/types.js'

import { normalizeOptionalArray } from './check.js'

// In principle, users can use `npx` with the "npm" resolver by doing:
//   npx --package=spyd-config-{name} spyd --config=spyd-config-{name} ...
// As a convenience, we allow this shortcut syntax:
//   npx --package=spyd-config-{name} spyd ...
// We do this by:
//  - Detecting whether `npx --package=spyd-config-{name}` is used
//     - This detection is based on `npm_*` environment variables injected by
//       `npx`
//  - Adding it as `--config=spyd-config-{name}`
export const addNpxShortcut = function (config) {
  if (!isNpxCall()) {
    return config
  }

  const npxConfigs = getNpxConfigs()
  const configs = normalizeOptionalArray(config)
  return [...npxConfigs, ...configs]
}

const isNpxCall = function () {
  return env.npm_command === 'exec'
}

const getNpxConfigs = function () {
  const npxPackages = env.npm_config_package
  return npxPackages === undefined
    ? []
    : npxPackages.split('\n').filter(isSharedConfig)
}

const isSharedConfig = function (npxPackage) {
  return npxPackage.startsWith(CONFIG_PLUGIN_TYPE.modulePrefix)
}
