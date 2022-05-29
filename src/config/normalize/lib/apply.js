import { remove, set, get } from 'wild-wild-path'

import { callInputFunc, callNoInputFunc, callConstraintFunc } from './call.js'
import { applyKeywords } from './keywords/main.js'

// Apply a rule on a specific property
export const applyRule = async function ({
  rule,
  rule: { pick, condition, default: defaultValue, compute },
  input,
  config,
  moves,
  warnings,
  opts,
}) {
  if (await againstPick(input, pick, opts)) {
    const configA = remove(config, opts.funcOpts.path)
    return { config: configA, warnings, moves }
  }

  if (await againstCondition(input, condition, opts)) {
    return { config, warnings, moves }
  }

  const configB = await computeInput(config, compute, opts)
  const configC = await addDefault(configB, defaultValue, opts)
  const inputA = get(configC, opts.funcOpts.path)
  return await applyKeywords({
    rule,
    input: inputA,
    config: configC,
    moves,
    warnings,
    opts,
  })
}

// Apply `pick[(input, opts)]` which omits the current input if `false` is
// returned. It also skips the current rule.
// For example, this is useful when several commands share some properties but
// not all.
const againstPick = async function (input, pick, opts) {
  return pick !== undefined && !(await callInputFunc(pick, input, opts))
}

// Apply `condition[(input, opts)]` which skips the current rule if `false`
// is returned.
const againstCondition = async function (input, condition, opts) {
  return (
    condition !== undefined && !(await callInputFunc(condition, input, opts))
  )
}

// Apply `compute[(opts)]` which sets an input from the system, instead of the
// user
const computeInput = async function (config, compute, opts) {
  if (compute === undefined) {
    return config
  }

  const input = await callNoInputFunc(compute, opts)
  return set(config, opts.funcOpts.path, input)
}

// Apply `default[(opts)]` which assigns a default value
const addDefault = async function (config, defaultValue, opts) {
  const input = get(config, opts.funcOpts.path)

  if (input !== undefined) {
    return config
  }

  const inputA = await callConstraintFunc(defaultValue, opts)
  return set(config, opts.funcOpts.path, inputA)
}
