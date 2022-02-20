import { pathToFileURL } from 'url'

import { wrapError } from '../../../error/wrap.js'

import { PluginError } from './error.js'
import { isBuiltinId, isInlineId } from './id.js'

// Builtin modules are lazy loaded for performance reasons.
// The return value is shallow cloned to make it a plain object instead of
// a dynamic `Module` instance.
//  - It also ensure plugins of same id and type but different configs do not
//    share the same top-level properties. However, they will share deep
//    properties by reference.
export const importPlugin = async function (id, name, builtins) {
  try {
    return await importPluginById(id, builtins)
  } catch (error) {
    throw wrapError(error, `Could not load "${name}.id"\n`, PluginError)
  }
}

const importPluginById = async function (id, builtins) {
  if (isInlineId(id)) {
    return { plugin: id }
  }

  if (isBuiltinId(id, builtins)) {
    const builtinPlugin = await builtins[id]()
    return { plugin: { ...builtinPlugin } }
  }

  const plugin = await import(pathToFileURL(id))
  return { plugin: { ...plugin }, path: id }
}
