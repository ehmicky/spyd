import { isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveModuleLocation } from './module.js'

// `pluginConfig[pluginProp]` can be:
//  - The direct value
//     - This is useful for programmatic usage,
//     - For example, by exposing to plugin consumers a function like:
//         (pluginConfig) => ({ plugin, ...pluginConfig })
//       which is passed as argument to this library
//  - A builtin identifier among `opts.builtins`
//     - Each value is an async function returning the plugin object
//     - In most cases, the function should just do a dynamic import to either
//       a local file or a Node module name
//        - This ensures plugins are lazy loaded
//     - We require users to do that dynamic import themselves, instead of just
//       supplying the file path or Node module name, because the `cwd` used
//       during resolution should be:
//        - From the library user's perspective, i.e. the file defining
//          `opts.builtins` (which is done automatically by dynamic `import()`
//          through implicit usage of `import.meta.file`)
//        - Not from the library's perspective (current `import.meta.file` of
//          this file)
//        - Nor from the library's consumers (`opts.cwd`)
//  - A file path starting with . or /
//  - A `file:` URL
//  - A Node module prefixed with `modulePrefix` (which is optional)
export const getLocationType = function (originalLocation, { builtins }) {
  if (originalLocation instanceof URL) {
    return 'fileUrl'
  }

  if (typeof originalLocation !== 'string') {
    return 'inline'
  }

  if (builtins[originalLocation] !== undefined) {
    return 'builtin'
  }

  return getPathLocationType(originalLocation)
}

const getPathLocationType = function (originalLocation) {
  if (originalLocation.startsWith('.') || isAbsolute(originalLocation)) {
    return 'path'
  }

  return 'module'
}

// URL instances are always absolute, so `cwd` resolution is not needed
const normalizeFileUrlLocation = [
  {
    schema: {
      type: 'object',
      properties: {
        protocol: {
          const: 'file:',
        },
      },
      errorMessage: 'must use "file:" as a URL protocol',
    },
    transform: fileURLToPath,
  },
  {
    path: ['exist', 'file', 'read'],
  },
]

const normalizeInlineLocation = [
  {
    // Strings are not allowed for inline plugins, but for other plugin types,
    // which should be shown in error messages
    schema: {
      type: ['string', 'object'],
      errorMessage: 'must be a string or a plain object',
    },
  },
]

const normalizeBuiltinLocation = []

const normalizePathLocation = [
  {
    path: ['exist', 'file', 'read'],
  },
]

const normalizeModuleLocation = [
  {
    schema: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'must not be an empty string' },
    },
    validate(value, { context: { modulePrefix } }) {
      if (modulePrefix === undefined) {
        throw new Error('must start with . or / when it is a file path.')
      }
    },
    transform: resolveModuleLocation,
  },
]

export const NORMALIZE_LOCATIONS = {
  fileUrl: normalizeFileUrlLocation,
  inline: normalizeInlineLocation,
  builtin: normalizeBuiltinLocation,
  path: normalizePathLocation,
  module: normalizeModuleLocation,
}
