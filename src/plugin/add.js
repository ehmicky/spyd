import filterObj from 'filter-obj'

import { loadPlugins } from './load.js'
import { PLUGIN_TYPES, PLUGIN_PROP_PREFIXES } from './types.js'
import { validatePlugins } from './validate.js'

// Several configuration properties (`runner`, `reporter`, `progress`, `store`)
// can be customized with custom modules. This loads them. Each type can specify
// builtin modules too.
// We separate selecting and configuring plugins to make it easier to
// include and exclude specific plugins on-the-fly.
// We use a configuration object.
// We prepend the plugin name to its type, camelCase. This format is chosen
// because this:
//  - keeps using a single delimiter character (dot) instead of mixing others
//    like - or _
//  - distinguishes between selecting plugins and configuring them
//  - allows - and _ in user-defined identifiers
//  - works unescaped with YAML, JSON and JavaScript
//  - works with CLI flags without confusion
//  - introduces only one level of indentation
// Most plugin types need only a single plugin per benchmark, but they still
// allow several for some use cases. Since the most common case is a single
// plugin, selecting plugins:
//  - can be either a string or an array of strings
//  - uses a singular property name
export const addPlugins = async function (config) {
  const pluginsConfigs = await Promise.all(
    PLUGIN_TYPES.map(
      ({ type, varName, selector, configPrefix, modulePrefix, builtins }) =>
        getPluginsByType({
          config,
          type,
          varName,
          selector,
          configPrefix,
          modulePrefix,
          builtins,
        }),
    ),
  )
  const pluginsConfigA = Object.fromEntries(pluginsConfigs)
  const configA = removePluginProps(config)
  return { ...configA, ...pluginsConfigA }
}

const getPluginsByType = async function ({
  config,
  type,
  varName,
  selector,
  configPrefix,
  modulePrefix,
  builtins,
}) {
  const ids = selectPlugins(selector, config)
  const plugins = await loadPlugins({
    ids,
    type,
    configPrefix,
    modulePrefix,
    config,
    builtins,
  })
  validatePlugins(plugins, type)
  return [varName, plugins]
}

const selectPlugins = function (selector, config) {
  if (selector === 'tasks.*') {
    return Object.keys(config.tasks)
  }

  return config[selector]
}

// Remove plugin properties, so only the normalized ones are available
const removePluginProps = function (config) {
  return filterObj(config, isNotPluginProp)
}

const isNotPluginProp = function (key) {
  return !PLUGIN_PROP_PREFIXES.some((propPrefix) => key.startsWith(propPrefix))
}
