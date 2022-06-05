// When a new warning is returned, add it to the list
export const addWarning = function (
  { warning },
  warnings,
  { prefix, originalName },
) {
  if (warning !== undefined) {
    // eslint-disable-next-line fp/no-mutating-methods
    warnings.push(`${prefix} "${originalName}" ${warning}`)
  }
}

// Log all warnings at the end.
// To customize how warnings are logged, `soft` can be used.
// Unlike errors:
//  - They are aggregated instead of being a single error stopping execution
//  - Therefore, `error` and `warnings` are never returned together even in
//    `soft` mode
// We sort warnings so their output is predictable even when using parallel
// rules.
export const logWarnings = function (warnings, soft) {
  if (soft || warnings.length === 0) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  const warningsStr = [...new Set(warnings)].sort().join('\n')
  // eslint-disable-next-line no-console, no-restricted-globals
  console.warn(warningsStr)
}
