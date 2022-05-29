import { callFunc } from '../call.js'

import { KEYWORDS } from './list/main.js'
import { applyReturnValue } from './return.js'
import { shouldSkipKeyword, shouldSkipMain } from './skip.js'

// The library features is provided through plugins called "keywords".
// Keywords perform logic based on the consumer's `input`.
// Users pass `definition` values to configure each keyword.
// Those provide the following named exports:
//  - `name` `{string}` (required): property name in rules
//  - `main` `function`: main function
//  - `hasInput` `boolean` (default: false): pass `input` to `main()`
//    as a second argument
//  - `undefinedInput` `boolean | null`: whether to skip the keyword if the
//    `input` is `undefined` or not
//  - `undefinedDefinition` `boolean` (default: false): skip the keyword if the
//    `definition` is a function returning `undefined`
// `main(definition[, input], opts)` arguments are:
//  - `definition`
//  - `input`: only if `keyword.hasInput` is `true`
//  - `opts`:
//      - `name`, `path`, `originalName`, `originalPath`
//      - `config`
//      - `context`
//      - `cwd`
// `main()` return value is optional. It is an object with optional properties:
//  - `value` `{any}`: modifies the input value.
//     - If `undefined`, the property is deleted
//  - `skip` `{boolean}`: if true, next keywords in the current rule are skipped
//  - `warning` `{string}`: print on the console
//  - `rename` `{string|array}`: move the input value to another property
//  - `path` `{string|array}`: hint when the input value has been moved to a
//    new path
export const applyKeywords = async function ({
  rule,
  input,
  config,
  moves,
  warnings,
  opts,
}) {
  // eslint-disable-next-line fp/no-let
  let state = { input, config, moves, warnings, opts }

  // eslint-disable-next-line fp/no-loops
  for (const keyword of KEYWORDS) {
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    state = await applyKeyword({ keyword, state, rule })

    // eslint-disable-next-line max-depth
    if (state.skip) {
      break
    }
  }

  return { config: state.config, warnings: state.warnings, moves: state.moves }
}

const applyKeyword = async function ({
  keyword: {
    name,
    main,
    hasInput = false,
    undefinedInput = false,
    undefinedDefinition = false,
  },
  state,
  state: { input, opts },
  rule,
}) {
  const definition = rule[name]

  if (shouldSkipKeyword(definition, input, undefinedInput)) {
    return state
  }

  const definitionA =
    typeof definition === 'function'
      ? await callFunc({
          func: definition,
          input,
          opts,
          hasInput,
          undefinedInput,
        })
      : definition

  if (shouldSkipMain(definitionA, undefinedDefinition)) {
    return state
  }

  const returnValue = await callFunc({
    func: main.bind(undefined, definitionA),
    input,
    opts,
    hasInput,
    undefinedInput,
  })
  return applyReturnValue({ returnValue, state })
}
