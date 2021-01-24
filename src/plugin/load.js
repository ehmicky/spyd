import { PluginError } from '../error/main.js'

// Import plugin's code
export const loadPlugins = async function ({
  ids,
  type,
  modulePrefix,
  builtins,
}) {
  return await Promise.all(
    ids.map((id) => loadPlugin({ id, type, modulePrefix, builtins })),
  )
}

const loadPlugin = async function ({ id, type, modulePrefix, builtins }) {
  const plugin = await importPlugin({ id, type, modulePrefix, builtins })
  return { ...plugin, id }
}

const importPlugin = async function ({ id, type, modulePrefix, builtins }) {
  const builtin = builtins[id]

  if (builtin !== undefined) {
    return builtin
  }

  const moduleName = `${modulePrefix}${id}`

  try {
    return await import(moduleName)
  } catch (error) {
    throw new PluginError(
      `Could not load '${type}' module '${moduleName}'\n\n${error.stack}`,
    )
  }
}
