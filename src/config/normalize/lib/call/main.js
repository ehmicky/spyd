import { handleError } from './error.js'

// Call `keyword.test()`.
// Keywords cannot validate inputs in `test()`, i.e. any exception is considered
// a keyword bug.
//  - This is because `test()` is called before definition function, which might
//    return `undefined`, i.e. might skip the keyword
//  - Inputs must be validated in `main()` instead
export const callTest = async function ({ test, input, info, keyword }) {
  return await callFunc({
    func: test,
    input,
    info,
    hasInput: true,
    keyword,
    errorType: 'keyword',
    bugType: 'keyword',
  })
}

// Call definition function.
// Exceptions starting with "must" can be thrown for invalid input.
// Other exceptions are considered invalid definitions.
export const callDefinition = async function ({
  definition,
  input,
  info,
  hasInput,
  test,
  keyword,
  exampleDefinition,
}) {
  return await callFunc({
    func: definition,
    input,
    info,
    hasInput,
    test,
    keyword,
    exampleDefinition,
    errorType: 'input',
    bugType: 'definition',
  })
}

// Call `keyword.normalize()`.
// Exceptions starting with "must" can be thrown for invalid definitions.
// Other exceptions are considered keyword bugs.
export const callNormalize = async function ({
  normalize,
  definition,
  info,
  keyword,
  exampleDefinition,
}) {
  const func = () => normalize(definition)
  return await callFunc({
    func,
    info,
    keyword,
    definition,
    exampleDefinition,
    hasInput: false,
    errorType: 'definition',
    bugType: 'keyword',
  })
}

// Call `keyword.main()`
// Exceptions starting with "must" can be thrown for invalid input.
// Other exceptions are considered keyword bugs.
export const callMain = async function ({
  main,
  normalizedDefinition,
  definition,
  input,
  info,
  hasInput,
  test,
  keyword,
}) {
  const func = main.bind(undefined, normalizedDefinition)
  return await callFunc({
    func,
    input,
    info,
    hasInput,
    test,
    keyword,
    definition,
    errorType: 'input',
    bugType: 'keyword',
  })
}

// Call a function from `test()`, `main()` or a definition.
// They are all:
//  - Optionally async
//  - Called with similar arguments
//  - Error handled
const callFunc = async function ({
  func,
  info: { originalName },
  info: { example, prefix, ...info },
  ...params
}) {
  const { input, hasInput } = params

  try {
    return hasInput ? await func(input, info) : await func(info)
  } catch (error) {
    throw handleError({ ...params, error, example, prefix, originalName })
  }
}
