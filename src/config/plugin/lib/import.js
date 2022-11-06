import { pathToFileURL } from 'node:url'

import isPlainObj from 'is-plain-obj'

import { PluginError } from './error.js'

// Builtin modules are lazy loaded for performance reasons.
// We shallow clone it the return value to ensure plugins of same location and
// type but different configs do not share the same top-level properties.
//   - However, they will share deep properties by reference.
export const importPlugin = async function (
  location,
  locationType,
  { name, builtins },
) {
  try {
    const { plugin, path } = await IMPORTERS[locationType](location, builtins)
    const pluginA = isPlainObj(plugin) ? { ...plugin } : plugin
    return { plugin: pluginA, path }
  } catch (cause) {
    throw new PluginError(`Could not load "${name}".`, { cause })
  }
}

const importInline = function (location) {
  return { plugin: location }
}

// We do not assume `builtins` methods are calling `import()`: they could return
// the plugin object as is.
// However, they are likely to call `import()`, therefore we handle a `default`
// import too.
const importBuiltin = async function (location, builtins) {
  const builtinPlugin = await builtins[location]()
  const plugin = isPlainObj(builtinPlugin.default)
    ? builtinPlugin.default
    : builtinPlugin
  return { plugin }
}

// We enforce default exports because:
//  - It allows plugin to make other exports
//  - It does not require wildcard imports when importing the plugin
//    programmatically
const importPath = async function (location) {
  // eslint-disable-next-line import/no-dynamic-require
  const { default: plugin } = await import(pathToFileURL(location))

  if (plugin === undefined) {
    throw new PluginError('The plugin must use a default export.')
  }

  return { plugin, path: location }
}

const IMPORTERS = {
  fileUrl: importPath,
  inline: importInline,
  builtin: importBuiltin,
  path: importPath,
  module: importPath,
}
