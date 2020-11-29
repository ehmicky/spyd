import { UserError, PluginError } from '../error/main.js'
import { PROGRESS_REPORTERS } from '../progress/reporters/main.js'
import { REPORTERS } from '../report/reporters/main.js'
import { RUNNERS } from '../run/runners/main.js'
import { STORES } from '../store/stores/main.js'

import { validateDeepObject } from './validate.js'

// Several configuration properties (`run`, `report`, `progress`, `store`) can
// be customized with custom modules. This loads them. Each type can specify
// builtin modules too.
// Configuration properties can be passed to each module.
export const loadAllPlugins = async function (config) {
  const pluginsConfig = await Promise.all(
    TYPES.map(({ type, builtins, single }) =>
      loadPlugins({ config, type, builtins, single }),
    ),
  )
  const pluginsConfigA = Object.fromEntries(pluginsConfig)
  return { ...config, ...pluginsConfigA }
}

const TYPES = [
  { type: 'run', builtins: RUNNERS },
  { type: 'report', builtins: REPORTERS },
  { type: 'progress', builtins: PROGRESS_REPORTERS },
  { type: 'store', builtins: STORES, single: true },
]

const loadPlugins = async function ({ config, type, builtins, single }) {
  const pluginConfig = config[type]

  validateDeepObject(pluginConfig, type)

  const plugins = await Promise.all(
    Object.entries(pluginConfig).map(([name, prop]) =>
      loadPlugin({ type, name, prop, builtins }),
    ),
  )

  if (single) {
    const plugin = getSinglePlugin(plugins, type)
    return [type, plugin]
  }

  return [type, plugins]
}

const loadPlugin = async function ({ type, name, prop, builtins }) {
  const plugin = await importPlugin({ type, name, builtins })
  return { ...plugin, name, config: prop }
}

const importPlugin = async function ({ type, name, builtins }) {
  const builtin = builtins[name]

  if (builtin !== undefined) {
    return builtin
  }

  try {
    return await import(name)
  } catch (error) {
    throw new PluginError(
      `Could not load '${type}' module '${name}'\n\n${error.stack}`,
    )
  }
}

const getSinglePlugin = function (plugins, type) {
  if (plugins.length > 1) {
    throw new UserError(`Cannot specify more than one '${type}'`)
  }

  return plugins[0]
}
