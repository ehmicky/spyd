import { isAbsolute } from 'path'

// `pluginConfig[pluginProp]` can be:
//  - The direct value
//     - This is useful for programmatic usage,
//     - For example, by exposing to plugin consumers a function like:
//         (pluginConfig) => ({ plugin, ...pluginConfig })
//       which is passed as argument to this library
//  - A builtin identifier among `opts.builtins`
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
