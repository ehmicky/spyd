import { has } from 'wild-wild-path'

import { deepMergePair } from '../../merge.js'
import { getDummyRules } from '../../normalize/dummy.js'

import { UserError, PluginError, ConsumerError } from './error.js'
import { safeNormalizeConfig } from './normalize.js'

// Plugins use an array of objects for both selection and configuration.
// This normalizes it.
// Most of the times, a single plugin per type is used. Therefore:
//  - A single item can be used instead of an array of items
//  - The property name is not pluralized
// This is optimized for configuration-less plugins by providing with a shortcut
// syntax: only the plugin `location` instead of a plugin object.
// Some configuration properties are shared by all plugins of a given type:
//  - Top-level properties can be used to configure them for all plugins
// When merging multiple configurations (CLI flags, programmatic, child and
// parent config files):
//  - This is optimized for replacing a whole list of plugins of a given type,
//    as opposed to patching specific parts of it
//     - This is simpler for the majority of cases
//  - However patching is possible using array updates objects
// It is possible to use the same plugin twice with different configurations:
//  - This is especially useful for using the same reporter but with different
//    `output`
//  - This is optional, since this might not be wanted for some plugins
//     - For example plugins which create combinations (like runners) since
//       should use variations instead
export const normalizePluginConfig = async function ({
  pluginConfig: unmergedConfig,
  plugin,
  pluginConfigRules,
  opts,
  opts: { name, sharedConfig, sharedConfigName, shared },
}) {
  const pluginConfig = deepMergePair(sharedConfig, unmergedConfig)

  if (pluginConfigRules === undefined && shared === undefined) {
    return pluginConfig
  }

  const parent = getParent.bind(undefined, {
    unmergedConfig,
    name,
    sharedConfigName,
  })
  const pluginConfigA = await normalizeSharedConfig({
    pluginConfig,
    pluginConfigRules,
    plugin,
    parent,
    opts,
  })
  const pluginConfigB = await normalizeSpecificConfig({
    pluginConfig: pluginConfigA,
    pluginConfigRules,
    parent,
    opts,
  })
  return pluginConfigB
}

// When the value was merged due to `sharedConfig`, ensure `parent` is correct
const getParent = function (
  { unmergedConfig, name, sharedConfigName },
  { originalPath },
) {
  return has(unmergedConfig, originalPath) ? name : sharedConfigName
}

const normalizeSharedConfig = async function ({
  pluginConfig,
  pluginConfigRules = [],
  plugin,
  parent,
  opts: { context, cwd, shared = [], prefix, keywords },
}) {
  return await safeNormalizeConfig(
    pluginConfig,
    new Set([getDummyRules(pluginConfigRules), shared]),
    {
      all: { cwd, prefix, parent, context: { ...context, plugin } },
      keywords,
      InputErrorType: ConsumerError,
      DefinitionErrorType: UserError,
    },
  )
}

const normalizeSpecificConfig = async function ({
  pluginConfig,
  pluginConfigRules = [],
  parent,
  opts: { context, cwd, shared = [], prefix, keywords },
}) {
  return await safeNormalizeConfig(
    pluginConfig,
    new Set([getDummyRules(shared), pluginConfigRules]),
    {
      all: { cwd, prefix, parent, context },
      keywords,
      InputErrorType: ConsumerError,
      DefinitionErrorType: PluginError,
    },
  )
}
