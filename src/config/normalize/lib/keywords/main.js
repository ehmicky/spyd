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
//  - `test` `(value, opts) => boolean`: skip the keyword when returning `false`
//  - `hasInput` `boolean` (default: false): pass `input` to `main()`
//    as a second argument
//  - `undefinedInput` `boolean`: if false (def), the keyword is skipped if the
//    `input` is `undefined`
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
//  - `options` `{object}`:
//     - modifies the `options` passed to definitions functions and
//       `keyword.main()`.
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
    test,
    hasInput = false,
    undefinedInput = false,
    undefinedDefinition = false,
    main,
  },
  state,
  state: { input, opts },
  rule,
}) {
  const definition = rule[name]

  if (
    await shouldSkipKeyword({ definition, input, undefinedInput, test, opts })
  ) {
    return state
  }

  const definitionA =
    typeof definition === 'function'
      ? await callFunc({ func: definition, input, opts, hasInput, test })
      : definition

  if (shouldSkipMain(definitionA, undefinedDefinition)) {
    return state
  }

  const returnValue = await callFunc({
    func: main.bind(undefined, definitionA),
    input,
    opts,
    hasInput,
    test,
  })
  return applyReturnValue({ returnValue, state })
}
