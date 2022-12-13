import { handleError } from './error.js'

// Call `keyword.test()`.
// Keywords cannot validate inputs in `test()`, i.e. any exception is considered
// a keyword bug.
//  - This is because `test()` is called before definition function, which might
//    return `undefined`, i.e. might skip the keyword
//  - Inputs must be validated in `main()` instead
export const callTest = async ({ test, testSync, ...params }) =>
  await callFunc({
    ...params,
    func: test,
    hasInput: true,
    sync: testSync,
    errorType: 'keyword',
    bugType: 'keyword',
  })

// Call definition function.
// Exceptions starting with "must" can be thrown for invalid input.
// Other exceptions are considered invalid definitions.
export const callDefinition = async ({ definition, sync, ...params }) =>
  await callFunc({
    ...params,
    func: definition,
    sync,
    errorType: 'input',
    bugType: 'definition',
  })

// Call `keyword.normalize()`.
// Exceptions starting with "must" can be thrown for invalid definitions.
// Other exceptions are considered keyword bugs.
export const callNormalize = async ({
  normalize,
  normalizeSync,
  definition,
  ...params
}) =>
  await callFunc({
    ...params,
    func: () => normalize(definition),
    definition,
    sync: normalizeSync,
    hasInput: false,
    errorType: 'definition',
    bugType: 'keyword',
  })

// Call `keyword.main()`
// Exceptions starting with "must" can be thrown for invalid input.
// Other exceptions are considered keyword bugs.
export const callMain = async ({
  main,
  mainSync,
  normalizedDefinition,
  ...params
}) =>
  await callFunc({
    ...params,
    func: main.bind(undefined, normalizedDefinition),
    sync: mainSync,
    errorType: 'input',
    bugType: 'keyword',
  })

// Call a function from `test()`, `main()` or a definition.
// They are all:
//  - Optionally async
//  - Called with similar arguments
//  - Error handled
// Synchronous functions do not use `await`, for performance
const callFunc = async ({
  func,
  info: { originalName },
  info: { example, prefix, ...info },
  sync,
  ...params
}) => {
  const { input, hasInput } = params

  try {
    const returnValue = hasInput ? func(input, info) : func(info)
    return sync ? returnValue : await returnValue
  } catch (error) {
    throw handleError({ ...params, error, example, prefix, originalName })
  }
}
