import camelcase from 'camelcase'

import { checkObject } from '../config/check.js'
import { UserError } from '../error/main.js'

// Retrieve plugin configuration object.
// We separate selecting and configuring plugins to make it easier to
// include and exclude specific plugins on-the-fly.
// We prepend the plugin name to its type, camelCase. This format is chosen
// because this:
//  - keeps using a single delimiter character (dot) instead of mixing others
//    like - or _
//  - distinguishes between selecting plugins and configuring them
//  - allows - and _ in user-defined identifiers
//  - works unescaped with YAML, JSON and JavaScript
//  - works with CLI flags without confusion
//  - introduces only one level of indentation
export const addPluginsConfig = function ({ plugins, config, configPrefix }) {
  return plugins.map((plugin) =>
    addPluginConfig({ plugin, config, configPrefix }),
  )
}

const addPluginConfig = function ({
  plugin,
  plugin: { id },
  config,
  configPrefix,
}) {
  const pluginConfig = getPluginConfig({ id, config, configPrefix })
  return { ...plugin, config: pluginConfig }
}

const getPluginConfig = function ({ id, config, configPrefix }) {
  const configPropName = getConfigPropName({ id, config, configPrefix })
  const pluginConfig = config[configPropName]

  if (pluginConfig === undefined) {
    return {}
  }

  checkObject(pluginConfig, configPropName)
  return pluginConfig
}

// Configuration properties are case-sensitive. Making them case-insensitive
// would introduce polymorphism, which means we (and any spyd config consumer)
// need to normalize case each time the configuration is read.
const getConfigPropName = function ({ id, config, configPrefix }) {
  const configPropName = camelcase([configPrefix, id])
  const invalidPropName = `${configPrefix}${id}`

  if (config[invalidPropName] !== undefined) {
    throw new UserError(
      `Please rename the configuration property "${invalidPropName}" to "${configPropName}".`,
    )
  }

  return configPropName
}
