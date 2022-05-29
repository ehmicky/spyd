/* eslint-disable max-lines */
import { set, remove } from 'wild-wild-path'

import { callInputFunc, callConstraintFunc, callNoInputFunc } from './call.js'
import { PLUGINS } from './keywords/main.js'
import { addMove, getRenamedPath, getMovedPath } from './move.js'
import { addWarning } from './warn.js'

export const performPlugins = async function ({
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
  for (const plugin of PLUGINS) {
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    state = await applyPlugin({ plugin, state, rule })

    // eslint-disable-next-line max-depth
    if (state.skip) {
      break
    }
  }

  return { config: state.config, warnings: state.warnings, moves: state.moves }
}

/* eslint-disable complexity, max-statements, max-lines-per-function */
const applyPlugin = async function ({
  plugin: { name, main, undefinedInput = false, hasInput = false },
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

  if (definitionA === undefined) {
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
