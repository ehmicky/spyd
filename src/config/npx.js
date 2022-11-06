import { env } from 'node:process'

import { isConfigFileModule } from './load/resolve.js'

// In principle, users can use `npx` with the "npm" resolver by doing:
//   npx --package={spydConfig} spyd --config={spydConfig} ...
// Where {spydConfig} is [@scope/]spyd-config-{name}
// As a convenience, we allow skipping the `--config` flag. We do this by:
//  - Detecting whether `npx --package={spydConfig}` is used
//     - Based on `npm_*` environment variables injected by `npx`
//  - Adding it as `--config={spydConfig}`
// This behaves as if `--config={spydConfig}` had been specified:
//  - Additional `--config` flags are kept
//  - The `--config` flag does not use its default value
export const addNpxShortcut = function (configFlags) {
  if (!isNpxCall()) {
    return configFlags
  }

  const { config: configOpt } = configFlags
  const npxConfigs = getNpxConfigs()

  if (configOpt === undefined) {
    return { ...configFlags, config: npxConfigs }
  }

  const configOptA = Array.isArray(configOpt)
    ? [...npxConfigs, ...configOpt]
    : [...npxConfigs, configOpt]
  return { ...configFlags, config: configOptA }
}

const isNpxCall = function () {
  return (
    env.npm_command === 'exec' &&
    env.npm_config_package !== undefined &&
    env.npm_config_package !== ''
  )
}

const getNpxConfigs = function () {
  return env.npm_config_package.split('\n').filter(isConfigFileModule)
}
