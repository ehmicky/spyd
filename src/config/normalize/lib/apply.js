import { remove, set, get } from 'wild-wild-path'

import {
  callValueFunc,
  callNoValueFunc,
  callUndefinedValueFunc,
} from './call.js'
import { validateAndModify } from './modify.js'

// Apply a rule on a specific property
// eslint-disable-next-line max-lines-per-function
export const applyRule = async function ({
  rule: {
    pick,
    condition,
    default: defaultValue,
    compute,
    path,
    glob,
    required,
    schema,
    validate,
    warn,
    transform,
    rename,
  },
  value,
  config,
  moves,
  warnings,
  opts,
}) {
  if (await againstPick(value, pick, opts)) {
    const configA = remove(config, opts.funcOpts.path)
    return { config: configA, warnings, moves }
  }

  if (await againstCondition(value, condition, opts)) {
    return { config, warnings, moves }
  }

  const configB = await computeValue(config, compute, opts)
  const configC = await addDefaultValue(configB, defaultValue, opts)
  const valueA = get(configC, opts.funcOpts.path)
  const {
    config: configD,
    warnings: warningsA,
    moves: movesA,
  } = await validateAndModify({
    value: valueA,
    config: configC,
    required,
    schema,
    path,
    glob,
    validate,
    warn,
    transform,
    rename,
    moves,
    warnings,
    opts,
  })
  return { config: configD, warnings: warningsA, moves: movesA }
}

// Apply `pick[(value, opts)]` which omits the current value if `false` is
// returned. It also skips the current rule.
// For example, this is useful when several commands share some properties but
// not all.
const againstPick = async function (value, pick, opts) {
  return pick !== undefined && !(await callValueFunc(pick, value, opts))
}

// Apply `condition[(value, opts)]` which skips the current rule if `false`
// is returned.
const againstCondition = async function (value, condition, opts) {
  return (
    condition !== undefined && !(await callValueFunc(condition, value, opts))
  )
}

// Apply `compute[(opts)]` which sets a value from the system, instead of the
// user
const computeValue = async function (config, compute, opts) {
  if (compute === undefined) {
    return config
  }

  const value = await callNoValueFunc(compute, opts)
  return set(config, opts.funcOpts.path, value)
}

// Apply `default[(opts)]` which assigns a default value
const addDefaultValue = async function (config, defaultValue, opts) {
  const value = get(config, opts.funcOpts.path)

  if (value !== undefined) {
    return config
  }

  const valueA = await callUndefinedValueFunc(defaultValue, opts)
  return set(config, opts.funcOpts.path, valueA)
}
