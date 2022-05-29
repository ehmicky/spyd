import { handleError } from './error.js'

// Call `keyword.test()`
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

// Call `keyword.normalize()`
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

// Call definition function
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

// Call `keyword.main()`
export const callMain = async function ({
  main,
  definition,
  input,
  info,
  hasInput,
  test,
  keyword,
}) {
  const func = main.bind(undefined, definition)
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
//  - Called with same arguments
//  - Error handled
const callFunc = async function ({
  func,
  input,
  info: { originalName },
  info: { example, prefix, ...info },
  hasInput,
  test,
  keyword,
  definition,
  exampleDefinition,
  errorType,
  bugType,
}) {
  try {
    return hasInput ? await func(input, info) : await func(info)
  } catch (error) {
    throw handleError({
      error,
      input,
      example,
      prefix,
      originalName,
      hasInput,
      test,
      keyword,
      definition,
      exampleDefinition,
      errorType,
      bugType,
    })
  }
}
