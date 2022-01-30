import omit from 'omit.js'

import { pick } from '../../utils/pick.js'
import { mergeConfigs } from '../merge/main.js'
import { DEFINITIONS } from '../normalize/definitions.js'
import { normalizeConfig } from '../normalize/main.js'

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
  id,
  config,
  context,
  configProp,
  topProps,
  pluginConfigDefinitions,
}) {
  const pluginConfig = config[configProp][id]
  const pluginConfigA = await normalizePluginConfig({
    pluginConfig,
    configProp,
    id,
    context,
    topProps,
    pluginConfigDefinitions,
  })
  const pluginConfigB = mergeTopProps(config, pluginConfigA, topProps)
  return pluginConfigB
}

const normalizePluginConfig = async function ({
  pluginConfig = {},
  configProp,
  id,
  context,
  topProps,
  pluginConfigDefinitions = [],
}) {
  const topDefinitions = getTopDefinitions(topProps)
  const prefix = `${configProp}.${id}`
  return await normalizeConfig(
    pluginConfig,
    [...topDefinitions, ...pluginConfigDefinitions],
    { context, prefix },
  )
}

// Retrieve definitions for properties which can be set both at the top-level
// and inside `*Config.{id}.*`
const getTopDefinitions = function (topProps) {
  return DEFINITIONS.filter(({ name }) => isTopDefinition(name, topProps)).map(
    omitDefault,
  )
}

export const isTopDefinition = function (name, topProps) {
  return topProps.some((topProp) => name.startsWith(topProp))
}

// The `default` value is already applied to the top-level property, which is
// merged afterwards. Applying it again on `*Config.{id}.*` would mean the
// top-level property would always be overridden by it, so we omit it.
const omitDefault = function (definition) {
  return omit.default(definition, ['default'])
}

// Merge top-level properties with `*Config.{id}.*` with lower priority
const mergeTopProps = function (config, pluginConfig, topProps) {
  const topConfig = pick(config, topProps)
  return mergeConfigs([topConfig, pluginConfig])
}
