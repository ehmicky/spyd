import { getObjectTokenType } from '../tokens/main.js'

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
    tokenType,
    missing: missingParent,
    value: valueA,
  } = handleMissingValue(value, token, classes)
  const childEntries = tokenType.iterate(valueA, token)
  return childEntries.map(
    ({ value: childValue, prop, missing: missingEntry }) => ({
      queryArray,
      value: childValue,
      path: [...path, prop],
      missing: missingParent || missingEntry,
    }),
  )
}

// When the value does not exist, we set it deeply with `set()` but not with
// `list|get|has()`.
// We filter out between those two cases using a `missing` property.
// We distinguish between missing properties that are:
//  - known, i.e. returned: prop|index|slice tokens
//  - unknown, i.e. not returned: any|regexp tokens
// Tokens like wildcards cannot do this since there is known property to add.
export const handleMissingValue = function (value, token, classes) {
  const tokenType = getObjectTokenType(token)
  const missing = tokenType.isMissing(value, classes)
  const valueA = missing ? tokenType.defaultValue : value
  return { tokenType, missing, value: valueA }
}
