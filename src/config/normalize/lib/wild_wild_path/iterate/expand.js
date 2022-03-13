import { iterateToken } from './iterate.js'
import { handleMissingValue } from './missing.js'

// Iteration among siblings is not sorted, for performance reasons.
//  - Consumers can sort it through using the `query` property
// However, iteration is guaranteed to return child entries before parent ones.
//  - This is useful for recursive logic which must often be applied in a
//    specific parent-child order
export const expandTokens = function (entries, index, classes) {
  const results = entries
    .filter(({ queryArray }) => queryArray.length !== index)
    .map((entry) => expandToken(entry, index, classes))
  const childEntriesA = results.flatMap(({ childEntries }) => childEntries)
  return childEntriesA
}

const expandToken = function ({ queryArray, value, path }, index, classes) {
  const token = queryArray[index]
  const {
    tokenTypeName,
    missing: missingParent,
    value: valueA,
  } = handleMissingValue(value, token, classes)
  const childEntries = iterateToken(valueA, token, tokenTypeName)
  const childEntriesA = childEntries.map(
    ({ value: childValue, prop, missing: missingEntry }) => ({
      queryArray,
      value: childValue,
      path: [...path, prop],
      missing: missingParent || missingEntry,
    }),
  )
  return { childEntries: childEntriesA }
}
