import { callValueFunc } from './call.js'
import { getPrefix } from './prefix.js'

// Apply `warn[(value, opts)]` which can return a string to print as warning
export const getWarning = async function (value, warn, opts) {
  if (warn === undefined) {
    return
  }

  const warningSuffix = await callValueFunc(warn, value, opts)
  return warningSuffix === undefined
    ? undefined
    : `${getPrefix(opts)} ${warningSuffix}`
}

// When a new warning is returned, add it to the list
export const addWarning = function (warnings, warning) {
  return warning === undefined ? warnings : [...warnings, warning]
}

// Log all warnings at the end.
// To customize how warnings are logged, `soft` can be used.
// Unlike errors:
//  - They are aggregated instead of being a single error stopping execution
//  - Therefore, `error` and `warnings` are never returned together even in
//    `soft` mode
export const logWarnings = function (warnings, soft) {
  if (!soft && warnings.length !== 0) {
    // eslint-disable-next-line no-console, no-restricted-globals
    console.warn(warnings.join('\n'))
  }
}
