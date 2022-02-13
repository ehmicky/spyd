import { pathToFileURL } from 'url'

import { PluginError } from '../../../error/main.js'
import { wrapError } from '../../../error/wrap.js'

import { isBuiltinId } from './id.js'

// Builtin modules are lazy loaded for performance reasons.
// The return value is shallow cloned to make it a plain object instead of
// a dynamic `Module` instance.
//  - It also ensure plugins of same id and type but different configs do not
//    share the same top-level properties. However, they will share deep
//    properties by reference.
export const importPlugin = async function (id, propName, builtins) {
  const plugin = await importPluginById(id, propName, builtins)
  return { ...plugin }
}

const importPluginById = async function (id, propName, builtins) {
  if (isBuiltinId(id, builtins)) {
    return await builtins[id]()
  }

  try {
    return await import(pathToFileURL(id))
  } catch (error) {
    throw wrapError(
      error,
      `Could not load "${propName}.id" "${id}"\n`,
      PluginError,
    )
  }
}
