import { env } from 'process'

import { CONFIG_PLUGIN_TYPE } from '../plugin/types/config.js'

// In principle, users can use `npx` with the "npm" resolver by doing:
//   npx --package=spyd-config-{name} spyd --config=spyd-config-{name} ...
// As a convenience, we allow this shortcut syntax:
//   npx --package=spyd-config-{name} spyd ...
// We do this by:
//  - Detecting whether `npx --package=spyd-config-{name}` is used
//     - This detection is based on `npm_*` environment variables injected by
//       `npx`
//  - Adding it as `--config=spyd-config-{name}`
// This behaves as if `--config=spyd-config-{name}` has been specified:
//  - Additional `--config` flags are kept
//  - The `--config` flag does not use its default value
export const addNpxShortcut = function (configOpt) {
  if (!isNpxCall()) {
    return configOpt
  }

  const npxConfigs = getNpxConfigs()

  if (configOpt === undefined) {
    return npxConfigs
  }

  return Array.isArray(configOpt)
    ? [...npxConfigs, ...configOpt]
    : [...npxConfigs, configOpt]
}

const isNpxCall = function () {
  return (
    env.npm_command === 'exec' &&
    env.npm_config_package !== undefined &&
    env.npm_config_package !== ''
  )
}

const getNpxConfigs = function () {
  return env.npm_config_package.split('\n').filter(isSharedConfig)
}

const isSharedConfig = function (npxPackage) {
  return npxPackage.startsWith(CONFIG_PLUGIN_TYPE.modulePrefix)
}
