import { deepMerge } from '../../merge.js'

// Plugin configurations with `id: "any"` are merged to all others, with lower
// priority
export const applySharedConfigs = function (pluginConfigs, { pluginProp }) {
  const sharedConfigs = pluginConfigs.filter((pluginConfig) =>
    isSharedConfig(pluginConfig, pluginProp),
  )

  if (sharedConfigs.length === 0) {
    return pluginConfigs
  }

  const sharedConfig = deepMerge(sharedConfigs)
  return pluginConfigs.map((pluginConfig) =>
    applySharedConfig(pluginConfig, sharedConfig, pluginProp),
  )
}

const applySharedConfig = function (pluginConfig, sharedConfig, pluginProp) {
  return isSharedConfig(pluginConfig, pluginProp)
    ? {}
    : deepMerge([sharedConfig, pluginConfig])
}

const isSharedConfig = function (pluginConfig, pluginProp) {
  return pluginConfig[pluginProp] === SHARED_ID
}

const SHARED_ID = 'any'
