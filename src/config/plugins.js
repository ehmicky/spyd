import { PluginError } from '../error/main.js'
import { PROGRESS_REPORTERS } from '../progress/reporters/main.js'
import { REPORTERS } from '../report/reporters/main.js'
import { RUNNERS } from '../run/runners/main.js'
import { STORES } from '../store/stores/main.js'

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
export const loadAllPlugins = async function (config) {
  const pluginsConfigs = await Promise.all(
    TYPES.map(({ type, selector, prefix, builtins }) =>
      loadPlugins({ config, type, selector, prefix, builtins }),
    ),
  )
  const pluginsConfigA = Object.fromEntries(pluginsConfigs)
  return { ...config, ...pluginsConfigA }
}

const TYPES = [
  {
    type: 'runner',
    selector: 'tasks.*',
    prefix: 'spyd-runner-',
    builtins: RUNNERS,
  },
  {
    type: 'reporter',
    selector: 'reporters',
    prefix: 'spyd-reporter-',
    builtins: REPORTERS,
  },
  {
    type: 'progress',
    selector: 'progresses',
    prefix: 'spyd-progress-',
    builtins: PROGRESS_REPORTERS,
  },
  {
    type: 'store',
    selector: 'stores',
    prefix: 'spyd-store-',
    builtins: STORES,
  },
]

const loadPlugins = async function ({
  config,
  type,
  selector,
  prefix,
  builtins,
}) {
  const pluginIds = selectPlugins(selector, config)
  const pluginConfigs = config[type]
  const plugins = await Promise.all(
    pluginIds.map((id) =>
      loadPlugin({ id, type, prefix, pluginConfigs, builtins }),
    ),
  )
  return [type, plugins]
}

const selectPlugins = function (selector, config) {
  if (selector === 'tasks.*') {
    return Object.keys(config.tasks)
  }

  return config[selector]
}

const loadPlugin = async function ({
  id,
  type,
  prefix,
  pluginConfigs,
  builtins,
}) {
  const plugin = await importPlugin({ id, type, prefix, builtins })
  const pluginConfig = pluginConfigs[id] === undefined ? {} : pluginConfigs[id]
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
