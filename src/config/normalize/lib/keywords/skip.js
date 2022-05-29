// `undefined` definitions are always skipped because:
//  - It allows any keyword to be disabled by setting `definition` to
//    `undefined`
//  - Usually `undefinedDefinition` is only useful when `definition` is a
//    function (e.g. in `compute|transform`)
//  - The consumer might accidentally set `definition` to `undefined`, e.g. when
//    mapping the `definition` object, and not expect any behavior change
//  - This allows any keyword to have default values
export const shouldSkipKeyword = function (definition, input, undefinedInput) {
  return definition === undefined || shouldSkipInput(input, undefinedInput)
}

// Based on `undefinedInput`, skip the keyword if:
//  - `false` (default): `input` is `undefined`
//  - `null`: `input` is not `undefined`
//  - `true`: never skip
const shouldSkipInput = function (input, undefinedInput) {
  return (
    (undefinedInput === false && input === undefined) ||
    (undefinedInput === null && input !== undefined)
  )
}

// Function definitions returning `undefined` are skipped, unless
// `undefinedDefinition` is `true`.
export const shouldSkipMain = function (definition, undefinedDefinition) {
  return definition === undefined && !undefinedDefinition
}
