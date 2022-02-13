import { deepMerge } from '../../merge.js'

import { isSharedId } from './id.js'

// Plugin configurations with `id: "any"` are merged to all others, with lower
// priority
export const applySharedConfigs = function (pluginConfigs, { pluginProp }) {
  const sharedConfigs = pluginConfigs.filter((pluginConfig) =>
    isSharedId(pluginConfig[pluginProp]),
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
  return isSharedId(pluginConfig[pluginProp])
    ? {}
    : deepMerge([sharedConfig, pluginConfig])
}
