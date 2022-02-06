import { PluginError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'
import { mergeConfigs } from '../merge/main.js'
import { getDummyDefinitions } from '../normalize/dummy.js'
import { has } from '../normalize/lib/prop_path/get.js'
import { normalizeUserConfig } from '../normalize/main.js'

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
export const getPluginConfig = async function ({
  configProp,
  plugin,
  plugin: { id },
  config: {
    [configProp]: { [id]: unmergedPluginConfig = {} },
  },
  topConfig,
  context,
  configInfos,
  pluginConfigDefinitions = [],
  sharedConfig,
}) {
  const pluginConfig = mergeConfigs([topConfig, unmergedPluginConfig])
  const prefix = getPrefix.bind(undefined, {
    unmergedPluginConfig,
    configProp,
    id,
  })
  const pluginConfigA = await normalizeSharedConfig({
    pluginConfig,
    sharedConfig,
    pluginConfigDefinitions,
    context,
    configInfos,
    plugin,
    prefix,
  })
  const pluginConfigB = await normalizeSpecificConfig({
    pluginConfig: pluginConfigA,
    sharedConfig,
    pluginConfigDefinitions,
    context,
    configInfos,
    prefix,
  })
  return pluginConfigB
}

const getPrefix = function (
  { unmergedPluginConfig, configProp, id },
  { path },
) {
  const prefix = has(unmergedPluginConfig, path) ? `${configProp}.${id}.` : ''
  return `Configuration property ${prefix}`
}

const normalizeSharedConfig = async function ({
  pluginConfig,
  sharedConfig,
  pluginConfigDefinitions,
  context,
  configInfos,
  plugin,
  prefix,
}) {
  const dummyDefinitions = getDummyDefinitions(pluginConfigDefinitions)
  return await normalizeUserConfig({
    config: pluginConfig,
    definitions: [...sharedConfig, ...dummyDefinitions],
    opts: { context: { ...context, plugin }, prefix },
    configInfos,
  })
}

const normalizeSpecificConfig = async function ({
  pluginConfig,
  sharedConfig,
  pluginConfigDefinitions,
  context,
  configInfos,
  prefix,
}) {
  const dummyDefinitions = getDummyDefinitions(sharedConfig)

  try {
    return await normalizeUserConfig({
      config: pluginConfig,
      definitions: [...dummyDefinitions, ...pluginConfigDefinitions],
      opts: { context, prefix },
      configInfos,
    })
  } catch (error) {
    throw wrapError(error, '', PluginError)
  }
}
