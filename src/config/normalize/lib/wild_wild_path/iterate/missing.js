import isPlainObj from 'is-plain-obj'

import { getTokenType } from '../tokens/main.js'

// When the value does not exist, we set it deeply with `set()` but not with
// `list|get|has()`.
// We filter out between those two cases using a `missing` property.
// We distinguish between missing properties that are:
//  - known, i.e. returned: prop|index|slice tokens
//  - unknown, i.e. not returned: any|regexp tokens
// Tokens like wildcards cannot do this since there is known property to add.
// Both non-enumerable and inherited properties:
//  - Are not listed by token types returning multiple entries like *
//  - But are handled by the other ones
export const handleMissingValue = function (value, token, classes) {
  const tokenType = getTokenType(token)
  const { missing, value: valueA } = tokenType.array
    ? handleMissingArrayValue(value)
    : handleMissingObjectValue(value, classes)
  return { tokenType, missing, value: valueA }
}

const handleMissingArrayValue = function (value) {
  return Array.isArray(value)
    ? { missing: false, value }
    : { missing: true, value: [] }
}

const handleMissingObjectValue = function (value, classes) {
  return isRecurseObject(value, classes)
    ? { missing: false, value }
    : { missing: true, value: {} }
}

// Whether a property is considered an object that can:
//  - Be recursed over
//  - Be cloned with `{...}`
//     - Therefore we do not allow class instances
// Values that are not recursed are considered atomic, like simple types, i.e.:
//  - Properties, even if they exist, will be considered missing
//     - With tokens like *, no entries will be returned
//  - Setting will override the value, not merge it
// This must return `false` for arrays.
// By default, we only consider plain objects
//  - Excluding:
//     - Class instances, including native ones (RegExp, Error, etc.)
//     - `Object.create({})`
//     - `import * as object from ...` (`Module` instance)
//  - This is because only plain objects are clonable, i.e. do not require
//    `mutate` to be `true`
const isRecurseObject = function (value, classes) {
  return classes
    ? typeof value === 'object' && value !== null
    : isPlainObj(value)
}