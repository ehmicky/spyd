import { pathToFileURL } from 'url'

import { wrapError } from '../../../error/wrap.js'

import { PluginError } from './error.js'
import { isBuiltinLocation, isInlineLocation } from './location.js'

// Builtin modules are lazy loaded for performance reasons.
// The return value is shallow cloned to make it a plain object instead of
// a dynamic `Module` instance.
//  - It also ensure plugins of same location and type but different configs do
//    not share the same top-level properties. However, they will share deep
//    properties by reference.
export const importPlugin = async function (
  location,
  { name, builtins, pluginProp },
) {
  try {
    return await importPluginByLocation(location, builtins)
  } catch (error) {
    throw wrapError(
      error,
      `Could not load "${name}.${pluginProp}"\n`,
      PluginError,
    )
  }
}

const importPluginByLocation = async function (location, builtins) {
  if (isInlineLocation(location)) {
    return { plugin: location }
  }

  if (isBuiltinLocation(location, builtins)) {
    const builtinPlugin = await builtins[location]()
    return { plugin: { ...builtinPlugin } }
  }

  const plugin = await import(pathToFileURL(location))
  return { plugin: { ...plugin }, path: location }
}
