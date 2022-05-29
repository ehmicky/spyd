/* eslint-disable max-lines */
import { set, remove } from 'wild-wild-path'

import { callInputFunc, callConstraintFunc, callNoInputFunc } from './call.js'
import { KEYWORDS } from './keywords/main.js'
import { addMove, getRenamedPath, getMovedPath } from './move.js'
import { addWarning } from './warn.js'

// The library features is provided through plugins called "keywords".
// Keywords perform logic based on the consumer's `input`.
// Users pass `definition` values to configure each keyword.
// Those provide the following named exports:
//  - `name` `{string}` (required): property name in rules
//  - `main` `function`: main function
//  - `hasInput` `boolean` (default: false): pass `input` to `main()`
//    as a second argument
//  - `undefinedInput` `boolean`: skip the keyword if:
//     - `false` (default): `input` is `undefined`
//     - `null`: `input` is not `undefined`
//     - `true`: never skip
//  - `undefinedDefinition` `boolean` (default: false):
//     - Skip the keyword if the `definition` is a function returning
//       `undefined`
//     - The keyword is always skipped if the `definition` is not a function and
//       is `undefined` because:
//        - It allows any keyword to be disabled by setting `definition` to
//          `undefined`
//        - Usually `undefinedDefinition` is only useful when `definition` is
//          a function (e.g. in `compute|transform`)
//        - The consumer might accidentally set `definition` to `undefined`,
//          e.g. when mapping the `definition` object, and not expect any
//          behavior change
//        - This allows any keyword to have default values
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

/* eslint-disable complexity, max-statements, max-lines-per-function */
const applyKeyword = async function ({
  keyword: {
    name,
    main,
    hasInput = false,
    undefinedInput = false,
    undefinedDefinition = false,
  },
  state,
  state: { input, config, moves, opts, warnings },
  rule,
}) {
  const definition = rule[name]

  if (
    definition === undefined ||
    (undefinedInput === false && input === undefined) ||
    (undefinedInput === null && input !== undefined)
  ) {
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

  if (definitionA === undefined && !undefinedDefinition) {
    return state
  }

  const returnValue = await callFunc({
    func: main.bind(undefined, definitionA),
    input,
    opts,
    hasInput,
    undefinedInput,
  })

  if (returnValue === undefined) {
    return state
  }

  const warningsA = applyWarnings(returnValue, warnings, opts)
  const { input: inputA, config: configA } = applyInput({
    returnValue,
    input,
    config,
    opts,
  })
  const movesA = applyPath(returnValue, moves, opts)
  const {
    config: configB,
    moves: movesB,
    opts: optsA,
  } = applyRename({
    returnValue,
    config: configA,
    moves: movesA,
    input: inputA,
    opts,
  })
  return {
    input: inputA,
    config: configB,
    moves: movesB,
    warnings: warningsA,
    opts: optsA,
    skip: returnValue.skip,
  }
}
/* eslint-enable complexity, max-statements, max-lines-per-function */

// TODO: call logic should not check `typeof function` anymore
const callFunc = async function ({
  func,
  input,
  opts,
  hasInput,
  undefinedInput,
}) {
  if (hasInput) {
    return await callInputFunc(func, input, opts)
  }

  if (undefinedInput === true) {
    return await callNoInputFunc(func, opts)
  }

  return await callConstraintFunc(func, opts)
}

const applyWarnings = function ({ warning }, warnings, opts) {
  return warning === undefined ? warnings : addWarning(warnings, warning, opts)
}

const applyInput = function ({
  returnValue,
  input,
  config,
  opts: {
    funcOpts: { path },
  },
}) {
  // We allow transforming to `undefined`, i.e. returning
  // `{ input: undefined }` is different from returning `{}`
  if (!('input' in returnValue) || returnValue.input === input) {
    return { input, config }
  }

  const { input: inputA } = returnValue
  const configA = setConfig(config, path, inputA)
  return { input: inputA, config: configA }
}

const applyPath = function (
  { path },
  moves,
  { funcOpts: { path: oldNamePath } },
) {
  if (path === undefined) {
    return moves
  }

  const newNamePath = getMovedPath(path, oldNamePath)
  return newNamePath.length === oldNamePath.length
    ? moves
    : addMove(moves, oldNamePath, newNamePath)
}

const applyRename = function ({
  returnValue: { rename },
  config,
  moves,
  input,
  opts,
  opts: {
    funcOpts,
    funcOpts: { name: oldNameString, path: oldNamePath },
  },
}) {
  if (rename === undefined) {
    return { config, moves, opts }
  }

  const { newNamePath, newNameString } = getRenamedPath(rename)

  if (newNameString === oldNameString) {
    return { config, moves, opts }
  }

  const configA = remove(config, oldNamePath)
  const configB = setConfig(configA, newNamePath, input)
  const movesA = addMove(moves, oldNamePath, newNamePath)
  return {
    config: configB,
    moves: movesA,
    opts: {
      ...opts,
      funcOpts: { ...funcOpts, path: newNamePath, name: newNameString },
    },
  }
}

const setConfig = function (config, path, input) {
  return input === undefined ? remove(config, path) : set(config, path, input)
}
/* eslint-enable max-lines */
