import { cleanObject } from '../../utils/clean.js'
import { pick } from '../../utils/pick.js'
import { mergeConfigs } from '../merge/main.js'

// Retrieve plugin configuration object.
// Plugins use both:
//  - An array of strings property for selection, for example `reporter`.
//     - The name is singular to optimize for the common case.
//     - This is useful for including|excluding specific plugins on-the-fly.
//  - A `*Config` object property where each key is the plugin id, for
//    configuration, for example `reporterConfig.debug.*`.
// The configuration property is also used by steps and tasks, for consistency.
// Some configuration properties can be overridden by plugins, depending on the
// plugin types.
//  - For example `output` can be overridden for a specific reporter using
//    `reporterConfig.{reporterId}.output`.
// Reasons for this format:
//  - Works with all of: CLI flags, programmatic and config file
//  - Optimized for patching configuration properties as opposed to replacing,
//    which makes more sense
//  - Works both for:
//     - Selection + configuration (reporter|runner)
//     - Configuration-only (steps|tasks)
//  - Simple to enable|disable plugins
//  - Optimized for the common use cases:
//     - Only one plugin
//     - No configuration
//  - Simple merging of those configuration properties:
//     - Deep merging of objects
//     - For all of:
//        - Array of `config`
//        - Parent and child config files
//        - CLI|programmatic flags with config file
//  - Allows properties to target both:
//     - All instances, for example `tasks`
//     - Specific instances, for example `runnerConfig.{runnerId}.tasks`
//  - Does not rely on top-level configuration properties which name is dynamic
//    since those make flags parsing and manipulation harder
//  - Does not rely on case or delimiters
//     - Which enables using - and _ in user-defined identifiers
//  - Works unescaped with YAML, JSON and JavaScript
export const addPluginsConfig = function ({
  plugins,
  config,
  configProp,
  topProps,
}) {
  const pluginsConfig = config[configProp]
  return plugins.map((plugin) =>
    addPluginConfig({ plugin, pluginsConfig, config, topProps }),
  )
}

const addPluginConfig = function ({
  plugin,
  plugin: { id },
  pluginsConfig: { [id]: pluginConfig = {} },
  config,
  topProps,
}) {
  const pluginConfigA = cleanObject(pluginConfig)
  const pluginConfigB = mergeTopProps(config, pluginConfigA, topProps)
  return { ...plugin, config: pluginConfigB }
}

// Merge `*Config.*` with `*Config.{id}.*` with lower priority
const mergeTopProps = function (config, pluginConfig, topProps) {
  const topConfig = pick(config, topProps)
  return mergeConfigs([topConfig, pluginConfig])
}
