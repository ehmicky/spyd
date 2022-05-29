import { applyKeywordMain } from './apply.js'
import { getDefinition, callDefinitionFunc } from './definition.js'
import { shouldSkipKeyword, shouldSkipMain } from './skip.js'

// The library features is provided through plugins called "keywords".
// Keywords perform logic based on the consumer's `input`.
// Users pass `definition` values to configure each keyword.
// Those provide the following named exports:
//  - `name` `{string}` (required): property name in rules
//  - `aliases` `{string[]}`: alias property names
//  - `main` `function`: main function
//  - `normalize` `(definition) => definition`:
//      - Normalize and validate the `definition`
//      - Must be a pure function, because it is memoized
//  - `test` `(value, info) => boolean`: skip the keyword when returning `false`
//  - `hasInput` `boolean` (default: false): pass `input` to `main()`
//    as a second argument
//  - `undefinedInput` `boolean`: if false (def), the keyword is skipped if the
//    `input` is `undefined`
//  - `undefinedDefinition` `boolean` (default: false): skip the keyword if the
//    `definition` is a function returning `undefined`
// `main(definition[, input], info)` arguments are:
//  - `definition`
//  - `input`: only if `keyword.hasInput` is `true`
//  - `info`:
//      - `name`, `path`, `originalName`, `originalPath`
//      - `inputs`
//      - `context`
//      - `cwd`
// `main()` return value is optional. It is an object with optional properties:
//  - `input` `{any}`: modifies the input value.
//     - If `undefined`, the property is deleted
//  - `info` `{object}`:
//     - Modifies the `info` passed to definitions functions and keyword.main()
//     - Merged shallowly
//     - This can be used for cross-keywords information passing
//  - `skip` `{boolean}`: if true, next keywords in the current rule are skipped
//  - `warning` `{string}`: print on the console
//  - `rename` `{string|array}`: move the input value to another property
//  - `path` `{string|array}`: hint when the input value has been moved to a
//    new path
// Keywords cannot have default `definition` because this would mean:
//  - Keyword would have some effect even without any explicit user definition
//  - Keyword cannot be skipped by user
//  - Keyword author might add default values like `false` which would be noop
//    in `main()`, but would evaluate definition function even if not needed
export const applyKeywords = async function ({
  rule,
  input,
  inputs,
  moves,
  warnings,
  info,
  keywords,
  sync,
}) {
  // eslint-disable-next-line fp/no-let
  let state = { input, inputs, moves, warnings, info }

  // eslint-disable-next-line fp/no-loops
  for (const keyword of keywords) {
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    state = await applyKeyword({ keyword, state, rule, sync })

    // eslint-disable-next-line max-depth
    if (state.skip) {
      break
    }
  }

  return { inputs: state.inputs, warnings: state.warnings, moves: state.moves }
}

// TODO: fix linting
// eslint-disable-next-line max-lines-per-function
const applyKeyword = async function ({
  keyword: {
    name: keyword,
    aliases,
    test,
    testSync,
    hasInput = false,
    undefinedInput = false,
    undefinedDefinition = false,
    exampleDefinition,
    normalize,
    normalizeSync,
    main,
    mainSync,
  },
  state,
  state: { input, info },
  rule,
  sync,
}) {
  const definition = getDefinition(rule, keyword, aliases)

  if (
    await shouldSkipKeyword({
      definition,
      input,
      undefinedInput,
      test,
      testSync,
      info,
      keyword,
    })
  ) {
    return state
  }

  const definitionA = await callDefinitionFunc({
    definition,
    input,
    info,
    hasInput,
    test,
    keyword,
    exampleDefinition,
    sync,
  })

  if (shouldSkipMain(definitionA, undefinedDefinition)) {
    return state
  }

  return await applyKeywordMain({
    definition: definitionA,
    normalize,
    normalizeSync,
    info,
    keyword,
    exampleDefinition,
    main,
    mainSync,
    input,
    hasInput,
    test,
    state,
  })
}
