import { dirname } from 'path'

import { checkDefinedStringArray, normalizeOptionalArray } from './check.js'
import { loadConfigContents } from './contents.js'
import { addNpxShortcut } from './npx.js'
import { resolveConfigPath } from './resolve.js'

// Load `spyd.*` and any child configuration files.
// `spyd.*` is optional, so this can return an empty array. This allows
// benchmarking on-the-fly in a terminal without having to create a
// configuration file.
export const loadConfigFile = async function (config = 'default') {
  const configA = addNpxShortcut(config)
  return await getConfigsInfos(configA, '.')
}

// The `config` property can optionally be an array.
//  - This allow merging a shared configuration with a non-shared one
// The "default" resolver:
//  - Is used as the default of the top-level `config` CLI flags
//  - Is not used when a `config` is specified because:
//     - This would probably not be intended by users
//     - This might lead to issues when using shared configurations
//       unintentionally merged with some local config
//  - Can be specified explicitely by users. This can be useful when overridding
//    a `config` property inherited from a child configuration.
const getConfigsInfos = async function (config, base) {
  const configs = normalizeOptionalArray(config)
  checkDefinedStringArray(configs, 'config')
  const configInfos = await Promise.all(
    configs.map((configA) => getConfigInfos(configA, base)),
  )
  return configInfos.flat()
}

const getConfigInfos = async function (config, base) {
  const configPath = await resolveConfigPath(config, base)

  if (configPath === undefined) {
    return []
  }

  const { config: childConfig, ...configContents } = await loadConfigContents(
    configPath,
  )
  const childConfigInfos = getChildConfigInfos(childConfig, configPath)
  return [...childConfigInfos, { configContents, base }]
}

// Configuration files can use shared configuration using the `config` property
// inside another configure file.
// This can be used to share both:
//  - Configs: repository-wide, machine-wide or organization-wide
//  - Benchmarks (config + tasks + dependencies) measuring either:
//     - A library performance (for its consumers)
//     - The machine performance
// Sharing benchmarks can be used to:
//  - Make benchmarks trustable by allowing users to:
//     - Reproduce results
//     - Check if results would change by tweaking the configuration or tasks
//  - Measure the same benchmark but on another machine or software
//  - Measure the same benchmark between competing libraries. For example, a
//    competing implementation could re-use the parent benchmark and add a task
//    file for its own implementation.
// Using shared configurations can be done both:
//  - As a one-off time, e.g. `npx`
//  - As a persisted installation, e.g. `npm install`
// This works with both the CLI and programmatic usage.
// The design encourages users:
//  - To separate the benchmark package from the library package
//     - So that the library package does not include any benchmarking code or
//       dependencies
//  - While still allowing running benchmark while developing library
//     - A monorepo setup could sometimes help with this
// The design encourages publishers to build as much as possible:
//  - As opposed to consumer during installation
//     - No arbitrary command execution for consumers, for security
//  - Except when not possible, e.g. binary compilation
// The intended workflow to share benchmarks is:
//  - Publisher:
//     - Publishes: config file, tasks files, dependencies
//        - Using any available resolver, e.g. npm
//        - The main exported file must be the config file
//           - On npm, this is the "main" file
//              - This can be "spyd.yml", since we use `require.resolve()`, not
//                `require()`
//     - Should specify peer pependencies requirements:
//        - For both `spyd` and runners used by config
//        - It should do so by using package manager-specific features to
//          require consumers to install specific version ranges of those
//           - With npm: `peerDependencies`
//           - With others without a similar concept: only document the
//             requirements in config's documentation
//        - Version ranges should be `>=minimumVersion` (not `^minimumVersion`)
//          to avoid having to re-define them all the time
//     - Should take into account that `cwd` is consumer-defined:
//        - Git repository is consumer's
//        - `cwd` in tasks file is consumer-defined
//        - Tasks must be defined in config file, not use the default lookup
//  - Consumer:
//     - Installs package manager (e.g. npm)
//     - Installs `spyd`
//     - Installs package
//        - This should also install package's dependencies
//     - With npm, this translates as either:
//        - npx --package=spyd-config-{name} spyd ...
//        - npm install -D spyd-config-{name};
//          spyd --config=spyd-config-{name}; (or add to config file)
//          spyd ...
// The package is resolved to a file path:
//  - This uses resolver-specific logic
// Publishing using containers might be allowed in the future but only when no
// other choices because:
//  - This requires more setup for publisher
//  - This does not use consumer's OS configuration
//  - There is a higher risk that the setup works for publishers but not
//    consumers, if publishers run benchmark not in the container
//  - For most containers (e.g. docker):
//     - This only runs on Linux
//     - The consumer might need to set some flags, e.g. for networking
const getChildConfigInfos = function (childConfig, configPath) {
  return childConfig === undefined
    ? []
    : getConfigsInfos(childConfig, dirname(configPath))
}
