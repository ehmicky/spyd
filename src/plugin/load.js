import { PluginError } from '../error/main.js'

// Import plugin's code and add its configuration
export const loadPlugins = async function ({
  ids,
  type,
  prefix,
  config,
  builtins,
}) {
  return await Promise.all(
    ids.map((id) => loadPlugin({ id, type, prefix, config, builtins })),
  )
}

const loadPlugin = async function ({ id, type, prefix, config, builtins }) {
  const plugin = await importPlugin({ id, type, prefix, builtins })
  const pluginConfig = getPluginConfig(id, config, type)
  return { ...plugin, id, config: pluginConfig }
}

const importPlugin = async function ({ id, type, prefix, builtins }) {
  const builtin = builtins[id]

  if (builtin !== undefined) {
    return builtin
  }

  const moduleName = `${prefix}${id}`

  try {
    return await import(moduleName)
  } catch (error) {
    throw new PluginError(
      `Could not load '${type}' module '${moduleName}'\n\n${error.stack}`,
    )
  }
}

const getPluginConfig = function (id, config, type) {
  const pluginConfigs = config[type]
  return pluginConfigs[id] === undefined ? {} : pluginConfigs[id]
}
