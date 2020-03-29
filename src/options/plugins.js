import { PROGRESS_REPORTERS } from '../progress/reporters/main.js'
import { REPORTERS } from '../report/reporters/main.js'
import { RUNNERS } from '../run/runners/main.js'
import { STORES } from '../store/stores/main.js'

import { validateDeepObject } from './validate.js'

// Several options (`run`, `report`, `progress`, `store`) can be customized with
// custom modules. This loads them. Each type can specify builtin modules too.
// Options can be passed to each module.
export const loadAllPlugins = async function (opts) {
  const pluginsOpts = await Promise.all(
    TYPES.map(({ type, builtins, single }) =>
      loadPlugins({ opts, type, builtins, single }),
    ),
  )
  const pluginsOptsA = Object.fromEntries(pluginsOpts)
  return { ...opts, ...pluginsOptsA }
}

const TYPES = [
  { type: 'run', builtins: RUNNERS },
  { type: 'report', builtins: REPORTERS },
  { type: 'progress', builtins: PROGRESS_REPORTERS },
  { type: 'store', builtins: STORES, single: true },
]

const loadPlugins = async function ({ opts, type, builtins, single }) {
  const pluginOpts = opts[type]

  validateDeepObject(pluginOpts, type)

  const plugins = await Promise.all(
    Object.entries(pluginOpts).map(([name, pluginOpt]) =>
      loadPlugin({ type, name, pluginOpt, builtins }),
    ),
  )

  if (single) {
    const plugin = getSinglePlugin(plugins, type)
    return [type, plugin]
  }

  return [type, plugins]
}

const loadPlugin = async function ({ type, name, pluginOpt, builtins }) {
  const plugin = await importPlugin({ type, name, builtins })
  return { ...plugin, name, opts: pluginOpt }
}

const importPlugin = async function ({ type, name, builtins }) {
  const builtin = builtins[name]

  if (builtin !== undefined) {
    return builtin
  }

  try {
    return await import(name)
  } catch (error) {
    throw new Error(
      `Could not load '${type}' module '${name}'\n\n${error.stack}`,
    )
  }
}

const getSinglePlugin = function (plugins, type) {
  if (plugins.length > 1) {
    throw new TypeError(`Cannot specify more than one '${type}'`)
  }

  return plugins[0]
}
