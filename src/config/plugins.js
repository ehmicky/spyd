import { PluginError } from '../error/main.js'
import { PROGRESS_REPORTERS } from '../progress/reporters/main.js'
import { REPORTERS } from '../report/reporters/main.js'
import { RUNNERS } from '../run/runners/main.js'
import { STORES } from '../store/stores/main.js'

// Several configuration properties (`runner`, `reporter`, `progress`, `store`)
// can be customized with custom modules. This loads them. Each type can specify
// builtin modules too.
// Configuration properties can be passed to each module.
// We use a nested object to set those. This uses a dot notation when in the
// CLI. This format is chosen because this:
//   - allows more complex properties in spyd.yml
//   - only requires a single delimiter character (dot) instead of mixing others
//     like - or _
//   - distinguishes between selecting plugins and configuring them
//   - allows - and _ in user-defined identifiers
//   - works unescaped with YAML and JSON
export const loadAllPlugins = async function (config) {
  const pluginsConfigs = await Promise.all(
    TYPES.map(({ type, prefix, builtins }) =>
      loadPlugins({ config, type, prefix, builtins }),
    ),
  )
  const pluginsConfigA = Object.fromEntries(pluginsConfigs)
  return { ...config, ...pluginsConfigA }
}

const TYPES = [
  { type: 'runner', prefix: 'spyd-runner-', builtins: RUNNERS },
  { type: 'reporter', prefix: 'spyd-reporter-', builtins: REPORTERS },
  { type: 'progress', prefix: 'spyd-progress-', builtins: PROGRESS_REPORTERS },
  { type: 'store', prefix: 'spyd-store-', builtins: STORES },
]

const loadPlugins = async function ({ config, type, prefix, builtins }) {
  const pluginConfigs = config[type]
  const plugins = await Promise.all(
    Object.entries(pluginConfigs).map(([id, pluginConfig]) =>
      loadPlugin({ type, prefix, id, pluginConfig, builtins }),
    ),
  )
  return [type, plugins]
}

const loadPlugin = async function ({
  type,
  prefix,
  id,
  pluginConfig,
  builtins,
}) {
  const plugin = await importPlugin({ type, prefix, id, builtins })
  return { ...plugin, id, config: pluginConfig }
}

const importPlugin = async function ({ type, prefix, id, builtins }) {
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
