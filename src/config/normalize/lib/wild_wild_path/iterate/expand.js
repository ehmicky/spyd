import { iterateToken } from './iterate.js'
import { handleMissingValue } from './missing.js'

// Iteration among siglings is not sorted, for performance reasons.
//  - Consumers can sort it through using the `query` property
// However, iteration is guaranteed to return child entries before parent ones.
//  - This is useful for recursive logic which must often be applied in a
//    specific parent-child order
export const expandToken = function (
  { queryArray, value, path },
  index,
  classes,
) {
  const token = queryArray[index]
  const {
    tokenTypeName,
    missing: missingParent,
    value: valueA,
  } = handleMissingValue(value, token, classes)
  const childEntries = iterateToken(valueA, token, tokenTypeName)
  return childEntries.map(
    ({ value: childValue, prop, missing: missingEntry }) => ({
      queryArray,
      value: childValue,
      path: [...path, prop],
      missing: missingParent || missingEntry,
    }),
  )
}
