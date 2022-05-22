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

/* eslint-disable fp/no-loops, max-depth */
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

  for (const plugin of PLUGINS) {
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    state = await applyPlugin({ plugin, state, rule })

    if (state.skip) {
      break
    }
  }

  return { config: state.config, warnings: state.warnings, moves: state.moves }
}
/* eslint-enable fp/no-loops, max-depth */

/* eslint-disable complexity, max-statements, max-lines-per-function */
const applyPlugin = async function ({
  plugin: { name, main, defined = true, input = false },
  state,
  state: { value, config, moves, opts, warnings },
  rule,
}) {
  const ruleArg = rule[name]

  if (
    ruleArg === undefined ||
    (defined === true && value === undefined) ||
    (defined === false && value !== undefined)
  ) {
    return state
  }

  const ruleArgA =
    typeof ruleArg === 'function'
      ? await callFunc({
          func: ruleArg,
          value,
          opts,
          input,
          defined,
        })
      : ruleArg

  if (ruleArgA === undefined) {
    return state
  }

  const returnValue = await callFunc({
    func: main.bind(undefined, ruleArgA),
    value,
    opts,
    input,
    defined,
  })

  if (returnValue === undefined) {
    return state
  }

  const warningsA = applyWarnings(returnValue, warnings, opts)
  const {
    config: configA,
    moves: movesA,
    opts: optsA,
  } = applyRename(returnValue, config, moves, value, opts)
  const { value: valueA, config: configB } = applyValue(
    returnValue,
    value,
    configA,
    optsA,
  )
  const movesB = applyPath(returnValue, movesA, optsA)
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
  if (warning === undefined) {
    return warnings
  }

  return addWarning(warnings, warning, opts)
}

// eslint-disable-next-line max-params
const applyRename = function ({ rename }, config, moves, value, opts) {
  const {
    funcOpts,
    funcOpts: { path: oldNamePath },
  } = opts

  if (rename === undefined) {
    return { config, moves, opts }
  }

  const { newNamePath, newNameString } = getRenamedPath(rename)
  const configA = renameValue(oldNamePath, newNamePath, config, value)
  const movesA = addMove(moves, oldNamePath, newNamePath)
  return {
    config: configA,
    moves: movesA,
    opts: {
      ...opts,
      funcOpts: { ...funcOpts, path: newNamePath, name: newNameString },
    },
  }
}

// eslint-disable-next-line max-params
const applyValue = function (
  returnValue,
  value,
  config,
  { funcOpts: { path } },
) {
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
  return addMove(moves, oldNamePath, newNamePath)
}

// eslint-disable-next-line max-params
const renameValue = function (oldNamePath, newNamePath, config, value) {
  const configA = remove(config, oldNamePath)
  return setValue(configA, newNamePath, value)
}

const setValue = function (config, path, value) {
  return value === undefined ? remove(config, path) : set(config, path, value)
}
/* eslint-enable max-lines */
