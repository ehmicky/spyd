import { handleMissingValue } from './missing.js'

// Iteration among siblings is not sorted, for performance reasons.
//  - Consumers can sort it through using the `query` property
// However, iteration is guaranteed to return child entries before parent ones.
//  - This is useful for recursive logic which must often be applied in a
//    specific parent-child order
export const expandTokens = function (entries, index, opts) {
  return entries
    .filter(({ queryArray }) => queryArray.length !== index)
    .flatMap((entry) => expandToken(entry, index, opts))
}

// Use the token to list entries against a target value.
const expandToken = function ({ queryArray, value, path }, index, opts) {
  const token = queryArray[index]
  const missingReturn = handleMissingValue(value, token, opts.classes)
  const childEntriesA = iterateToken(token, missingReturn, opts)
  return childEntriesA.map(
    ({ value: childValue, prop, missing: missingEntry }) => ({
      queryArray,
      value: childValue,
      path: [...path, prop],
      missing: missingReturn.missing || missingEntry,
    }),
  )
}

const iterateToken = function (
  token,
  { tokenType, missing: missingParent, value },
  { inherited, missing: includeMissing },
) {
  if (includeMissing) {
    return tokenType.iterate(value, token, inherited)
  }

  if (missingParent) {
    return []
  }

  const childEntries = tokenType.iterate(value, token, inherited)
  return childEntries.filter(isNotMissing)
}

const isNotMissing = function ({ missing }) {
  return !missing
}
