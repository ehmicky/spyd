import isPlainObj from 'is-plain-obj'

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
export const isRecurseObject = function (value, classes) {
  return classes
    ? typeof value === 'object' && value !== null
    : isPlainObj(value)
}
