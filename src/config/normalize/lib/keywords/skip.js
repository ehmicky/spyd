import { callFunc } from '../call.js'

// `undefined` definitions are always skipped because:
//  - It allows any keyword to be disabled by setting `definition` to
//    `undefined`
//  - Usually `undefinedDefinition` is only useful when `definition` is a
//    function (e.g. in `compute|transform`)
//  - The consumer might accidentally set `definition` to `undefined`, e.g. when
//    mapping the `definition` object, and not expect any behavior change
//  - This allows any keyword to have default values
// Also skip the keyword if `undefinedInput` is `false` (default) and input is
// `undefined`.
export const shouldSkipKeyword = async function ({
  definition,
  input,
  undefinedInput,
  test,
  opts,
}) {
  return (
    definition === undefined ||
    (!undefinedInput && input === undefined) ||
    (await hasSkippedTest({ test, input, opts, undefinedInput }))
  )
}

// If `test(value, opts) => boolean` is defined and returns `false`, the keyword
// is skipped.
// To avoid calling unnecessary functions, this is performed:
//  - Before the definition function
//  - After `undefinedInput` is checked
// `input` is passed even if `hasInput` is `false`
//  - This is because some keywords might only apply when the input has a
//    specific value (e.g. `undefined` for `required|default` keywords), i.e.
//    need to check the input during `test()` but should not pass it during
//    `main()` nor the definition function
const hasSkippedTest = async function ({ test, input, opts, undefinedInput }) {
  return (
    test === undefined ||
    !(await callFunc({
      func: test,
      input,
      opts,
      hasInput: true,
      undefinedInput,
    }))
  )
}

// Function definitions returning `undefined` are skipped, unless
// `undefinedDefinition` is `true`.
export const shouldSkipMain = function (definition, undefinedDefinition) {
  return definition === undefined && !undefinedDefinition
}
