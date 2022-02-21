import { getDummyDefinitions } from '../../normalize/dummy.js'

import { UserError, PluginError, ConsumerError } from './error.js'
import { safeNormalizeConfig } from './normalize.js'

// Plugins use an array of objects for both selection and configuration.
// This normalizes it.
// Most of the times, a single plugin per type is used. Therefore:
//  - A single item can be used instead of an array of items
//  - The property name is not pluralized
// This is optimized for configuration-less plugins by providing with a shortcut
// syntax: only the plugin `id` instead of a plugin object.
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
  pluginConfig,
  plugin,
  context,
  cwd,
  pluginConfigDefinitions = [],
  item,
}) {
  const pluginConfigA = await normalizeSharedConfig({
    pluginConfig,
    item,
    pluginConfigDefinitions,
    context,
    cwd,
    plugin,
    propName,
  })
  const pluginConfigB = await normalizeSpecificConfig({
    pluginConfig: pluginConfigA,
    item,
    pluginConfigDefinitions,
    context,
    cwd,
    propName,
  })
  return pluginConfigB
}

const normalizeSharedConfig = async function ({
  pluginConfig,
  item,
  pluginConfigDefinitions,
  context,
  cwd,
  plugin,
  propName,
}) {
  const dummyDefinitions = getDummyDefinitions(pluginConfigDefinitions)
  return await safeNormalizeConfig(
    pluginConfig,
    [...item, ...dummyDefinitions],
    {
      context: { ...context, plugin },
      prefix: propName,
      cwd,
      UserErrorType: ConsumerError,
      SystemErrorType: UserError,
    },
  )
}

const normalizeSpecificConfig = async function ({
  pluginConfig,
  item,
  pluginConfigDefinitions,
  context,
  cwd,
  propName,
}) {
  const dummyDefinitions = getDummyDefinitions(item)
  return await safeNormalizeConfig(
    pluginConfig,
    [...dummyDefinitions, ...pluginConfigDefinitions],
    {
      context,
      prefix: propName,
      cwd,
      UserErrorType: ConsumerError,
      SystemErrorType: PluginError,
    },
  )
}
