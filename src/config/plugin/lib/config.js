import { PluginError } from '../../../error/main.js'
import { deepMerge } from '../../merge.js'
import { getDummyDefinitions } from '../../normalize/dummy.js'
import { has } from '../../normalize/lib/prop_path/get.js'
import { normalizeConfig } from '../../normalize/main.js'

// Plugins use an array of objects for both selection and configuration.
// This normalizes it.
// Most of the times, a single plugin per type is used. Therefore:
//  - A single item can be used instead of an array of items
//  - The property name is not pluralized
// This is optimized for configuration-less plugins by providing with a shortcut
// syntax: only the plugin `id` instead of a plugin object.
// Some configuration properties are shared by all plugins of a given type:
//  - Top-level properties can be used to configure them for all plugins
// When merging multiple configurations (CLI flags, programmatic, child and
// parent config files):
//  - This is optimized for replacing a whole list of plugins of a given type,
//    as opposed to patching specific parts of it
//     - This is simpler for the majority of cases
// It is possible to use the same plugin twice with different configurations:
//  - This is especially useful for using the same reporter but with different
//    `output`
//  - This is optional, since this might not be wanted for some plugins
//     - For example plugins which create combinations (like runners) since
//       should use variations instead
export const normalizePluginConfig = async function ({
  propName,
  sharedConfig,
  pluginConfig: unmergedConfig,
  plugin,
  context,
  cwd,
  pluginConfigDefinitions = [],
  item,
}) {
  const pluginConfig = deepMerge([sharedConfig, unmergedConfig])
  const prefix = getPrefix.bind(undefined, unmergedConfig, propName)
  const pluginConfigA = await normalizeSharedConfig({
    pluginConfig,
    item,
    pluginConfigDefinitions,
    context,
    cwd,
    plugin,
    prefix,
  })
  const pluginConfigB = await normalizeSpecificConfig({
    pluginConfig: pluginConfigA,
    item,
    pluginConfigDefinitions,
    context,
    cwd,
    prefix,
  })
  return pluginConfigB
}

const getPrefix = function (unmergedConfig, propName, { path }) {
  return has(unmergedConfig, path) ? `${propName}.` : undefined
}

const normalizeSharedConfig = async function ({
  pluginConfig,
  item,
  pluginConfigDefinitions,
  context,
  cwd,
  plugin,
  prefix,
}) {
  const dummyDefinitions = getDummyDefinitions(pluginConfigDefinitions)
  return await normalizeConfig(pluginConfig, [...item, ...dummyDefinitions], {
    context: { ...context, plugin },
    prefix,
    cwd,
  })
}

const normalizeSpecificConfig = async function ({
  pluginConfig,
  item,
  pluginConfigDefinitions,
  context,
  cwd,
  prefix,
}) {
  const dummyDefinitions = getDummyDefinitions(item)
  return await normalizeConfig(
    pluginConfig,
    [...dummyDefinitions, ...pluginConfigDefinitions],
    { context, prefix, SystemErrorType: PluginError, cwd },
  )
}
