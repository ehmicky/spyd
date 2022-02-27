import { callValueFunc } from './call.js'
import { getPrefix } from './validate.js'

// Apply `warn(value, opts)` which can return a string to print as warning
export const getWarnings = async function (value, warn, opts) {
  if (warn === undefined) {
    return
  }

  const warningSuffixes = await Promise.all(
    warn.map((warnFunc) => callValueFunc(warnFunc, value, opts)),
  )
  const warningSuffixesA = warningSuffixes.filter(Boolean)

  if (warningSuffixesA.length === 0) {
    return
  }

  const prefix = getPrefix(opts)
  return warningSuffixesA.map((warningSuffix) => `${prefix} ${warningSuffix}`)
}

// When new warnings are returned, add them to the list
export const addWarnings = function (warnings, newWarnings) {
  return newWarnings === undefined ? warnings : [...warnings, ...newWarnings]
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
