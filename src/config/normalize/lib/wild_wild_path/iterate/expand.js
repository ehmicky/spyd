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
const expandToken = function (
  { queryArray, value, path },
  index,
  { classes, inherited },
) {
  const token = queryArray[index]
  const {
    tokenType,
    missing: missingParent,
    value: valueA,
  } = handleMissingValue(value, token, classes)
  const childEntries = tokenType.iterate(valueA, token, inherited)
  return childEntries.map(
    ({ value: childValue, prop, missing: missingEntry }) => ({
      queryArray,
      value: childValue,
      path: [...path, prop],
      missing: missingParent || missingEntry,
    }),
  )
}
