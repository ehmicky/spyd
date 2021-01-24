import { PluginError } from '../error/main.js'

// Import plugin's code
export const loadPlugins = async function ({
  ids,
  type,
  modulePrefix,
  builtins,
}) {
  const idsA = Array.isArray(ids) ? ids : [ids]
  const idsB = [...new Set(idsA)]
  return await Promise.all(
    idsB.map((id) => loadPlugin({ id, type, modulePrefix, builtins })),
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
