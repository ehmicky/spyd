import { loadPlugins } from './load.js'
import { PLUGIN_TYPES } from './types.js'
import { validatePlugins } from './validate.js'

// Several configuration properties (`runner`, `reporter`, `progress`, `store`)
// can be customized with custom modules. This loads them. Each type can specify
// builtin modules too.
// We separate selecting and configuring plugins to make it easier to
// include and exclude specific plugins on-the-fly.
// We use a nested object for configuration. This uses a dot notation when in
// the CLI. This format is chosen because this:
//   - allows more complex properties in spyd.*
//   - only requires a single delimiter character (dot) instead of mixing others
//     like - or _
//   - distinguishes between selecting plugins and configuring them
//   - allows - and _ in user-defined identifiers
//   - works unescaped with YAML and JSON
export const addPlugins = async function (config) {
  const pluginsConfigs = await Promise.all(
    PLUGIN_TYPES.map(({ type, selector, prefix, builtins }) =>
      getPluginsByType({ config, type, selector, prefix, builtins }),
    ),
  )
  const pluginsConfigA = Object.fromEntries(pluginsConfigs)
  return { ...config, ...pluginsConfigA }
}

const getPluginsByType = async function ({
  config,
  type,
  selector,
  prefix,
  builtins,
}) {
  const ids = selectPlugins(selector, config)
  const plugins = await loadPlugins({ ids, type, prefix, config, builtins })
  validatePlugins(plugins, type)
  return [type, plugins]
}

const selectPlugins = function (selector, config) {
  if (selector === 'tasks.*') {
    return Object.keys(config.tasks)
  }

  return config[selector]
}
