/* eslint-disable max-lines */
import { set, remove } from 'wild-wild-path'

import {
  callValueFunc,
  callUndefinedValueFunc,
  callNoValueFunc,
} from './call.js'
import { addMove, getRenamedPath, getMovedPath } from './move.js'
import { PLUGINS } from './plugins/main.js'
import { addWarning } from './warn.js'

export const performPlugins = async function ({
  rule,
  value,
  config,
  moves,
  warnings,
  opts,
}) {
  // eslint-disable-next-line fp/no-let
  let state = { value, config, moves, warnings, opts }

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
  plugin: { name, main, defined = true, input = false },
  state,
  state: { value, config, moves, opts, warnings },
  rule,
}) {
  const definition = rule[name]

  if (
    definition === undefined ||
    (defined === true && value === undefined) ||
    (defined === false && value !== undefined)
  ) {
    return state
  }

  const definitionA =
    typeof definition === 'function'
      ? await callFunc({ func: definition, value, opts, input, defined })
      : definition

  if (definitionA === undefined) {
    return state
  }

  const returnValue = await callFunc({
    func: main.bind(undefined, definitionA),
    value,
    opts,
    input,
    defined,
  })

  if (returnValue === undefined) {
    return state
  }

  const warningsA = applyWarnings(returnValue, warnings, opts)
  const { value: valueA, config: configA } = applyValue({
    returnValue,
    value,
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
    value: valueA,
    opts,
  })
  return {
    value: valueA,
    config: configB,
    moves: movesB,
    warnings: warningsA,
    opts: optsA,
    skip: returnValue.skip,
  }
}
/* eslint-enable complexity, max-statements, max-lines-per-function */

// TODO: call logic should not check `typeof function` anymore
const callFunc = async function ({ func, value, opts, input, defined }) {
  if (input) {
    return await callValueFunc(func, value, opts)
  }

  if (defined === null) {
    return await callNoValueFunc(func, opts)
  }

  return await callUndefinedValueFunc(func, opts)
}

const applyWarnings = function ({ warning }, warnings, opts) {
  return warning === undefined ? warnings : addWarning(warnings, warning, opts)
}

const applyValue = function ({
  returnValue,
  value,
  config,
  opts: {
    funcOpts: { path },
  },
}) {
  // We allow transforming to `undefined`, i.e. returning
  // `{ value: undefined }` is different from returning `{}`
  if (!('value' in returnValue) || returnValue.value === value) {
    return { value, config }
  }

  const { value: valueA } = returnValue
  const configA = setValue(config, path, valueA)
  return { value: valueA, config: configA }
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
  value,
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
  const configB = setValue(configA, newNamePath, value)
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

const setValue = function (config, path, value) {
  return value === undefined ? remove(config, path) : set(config, path, value)
}
/* eslint-enable max-lines */
