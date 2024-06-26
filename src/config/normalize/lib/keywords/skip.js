import { callTest } from '../call/main.js'

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
export const shouldSkipKeyword = async ({
  definition,
  input,
  undefinedInput,
  test,
  testSync,
  info,
  keyword,
}) =>
  definition === undefined ||
  (!undefinedInput && input === undefined) ||
  (await hasSkippedTest({ test, testSync, input, info, keyword }))

// If `test(value, info) => boolean` is defined and returns `false`, the keyword
// is skipped.
// To avoid calling unnecessary functions, this is performed:
//  - Before the definition function
//  - After `undefinedInput` is checked
// `input` is passed even if `hasInput` is `false`
//  - This is because some keywords might only apply when the input has a
//    specific value (e.g. `undefined` for `required|default` keywords), i.e.
//    need to check the input during `test()` but should not pass it during
//    `main()` not the definition function
const hasSkippedTest = async ({ test, testSync, input, info, keyword }) =>
  test !== undefined &&
  !(await callTest({ test, testSync, input, info, keyword }))

// Function definitions returning `undefined` are skipped, unless
// `undefinedDefinition` is `true`.
export const shouldSkipMain = (definition, undefinedDefinition) =>
  definition === undefined && !undefinedDefinition
