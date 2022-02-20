import { isAbsolute } from 'path'

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
//  - A Node module prefixed with `modulePrefix` (which is optional)
export const getLocationInfo = function (
  pluginConfig,
  { pluginProp, builtins },
) {
  const originalLocation = pluginConfig[pluginProp]
  const locationType = getLocationType(originalLocation, builtins)
  return { originalLocation, locationType }
}

const getLocationType = function (originalLocation, builtins) {
  if (typeof originalLocation !== 'string') {
    return 'inline'
  }

  if (builtins[originalLocation] !== undefined) {
    return 'builtin'
  }

  if (isPathLocation(originalLocation)) {
    return 'path'
  }

  return 'module'
}

const isPathLocation = function (originalLocation) {
  return originalLocation.startsWith('.') || isAbsolute(originalLocation)
}
