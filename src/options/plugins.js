import { REPORTERS } from '../report/reporters/main.js'
import { PROGRESS_REPORTERS } from '../progress/reporters/main.js'

import { validateDeepObject } from './validate.js'

// Several options (`run`, `report`, `progress`, `store`) can be customized with
// custom modules. This loads them. Each type can specify builtin modules too.
// Options can be passed to each module.
export const loadAllPlugins = async function(opts) {
  const pluginsOpts = await Promise.all(
    TYPES.map(({ type, builtins }) => loadPlugins({ opts, type, builtins })),
  )
  const pluginsOptsA = Object.fromEntries(pluginsOpts)
  return { ...opts, ...pluginsOptsA }
}

const TYPES = [
  { type: 'report', builtins: REPORTERS },
  { type: 'progress', builtins: PROGRESS_REPORTERS },
]

const loadPlugins = async function({ opts, type, builtins }) {
  const pluginOpts = opts[type]

  validateDeepObject(pluginOpts, type)

  const plugins = await Promise.all(
    Object.entries(pluginOpts).map(([name, pluginOpt]) =>
      loadPlugin({ type, name, pluginOpt, builtins }),
    ),
  )
  return [type, plugins]
}

const loadPlugin = async function({ type, name, pluginOpt, builtins }) {
  const plugin = await importPlugin({ type, name, builtins })
  return { ...plugin, name, opts: pluginOpt }
}

const importPlugin = function({ type, name, builtins }) {
  const builtin = builtins[name]

  if (builtin !== undefined) {
    return builtin
  }

  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(name)
  } catch (error) {
    throw new Error(
      `Could not load '${type}' module '${name}'\n\n${error.stack}`,
    )
  }
}
