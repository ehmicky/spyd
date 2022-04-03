import { pathToFileURL } from 'url'

import { wrapError } from '../../../error/wrap.js'

import { PluginError } from './error.js'

// Builtin modules are lazy loaded for performance reasons.
// The return value is shallow cloned to make it a plain object instead of
// a dynamic `Module` instance.
//  - It also ensure plugins of same location and type but different configs do
//    not share the same top-level properties. However, they will share deep
//    properties by reference.
export const importPlugin = async function (
  location,
  locationType,
  { name, builtins },
) {
  try {
    return await IMPORTERS[locationType](location, builtins)
  } catch (error) {
    throw wrapError(error, `Could not load "${name}"\n`, PluginError)
  }
}

const importInline = function (location) {
  return { plugin: location }
}

const importBuiltin = async function (location, builtins) {
  const builtinPlugin = await builtins[location]()
  return { plugin: { ...builtinPlugin } }
}

const importPath = async function (location) {
  // eslint-disable-next-line import/no-dynamic-require
  const plugin = await import(pathToFileURL(location))
  return { plugin: { ...plugin }, path: location }
}

const IMPORTERS = {
  fileUrl: importPath,
  inline: importInline,
  builtin: importBuiltin,
  path: importPath,
  module: importPath,
}
