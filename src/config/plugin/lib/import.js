import { pathToFileURL } from 'url'

import { PluginError } from '../../../error/main.js'
import { wrapError } from '../../../error/wrap.js'

import { isBuiltinId, isInlineId } from './id.js'

// Builtin modules are lazy loaded for performance reasons.
// The return value is shallow cloned to make it a plain object instead of
// a dynamic `Module` instance.
//  - It also ensure plugins of same id and type but different configs do not
//    share the same top-level properties. However, they will share deep
//    properties by reference.
export const importPlugin = async function (id, propName, builtins) {
  if (isInlineId(id)) {
    return { plugin: id }
  }

  if (isBuiltinId(id, builtins)) {
    const plugin = await builtins[id]()
    return { plugin: { ...plugin } }
  }

  try {
    const plugin = await import(pathToFileURL(id))
    return { plugin: { ...plugin }, path: id }
  } catch (error) {
    throw wrapError(
      error,
      `Could not load "${propName}.id" "${id}"\n`,
      PluginError,
    )
  }
}
