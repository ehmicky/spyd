import pReduce from 'p-reduce'

import { cleanObject } from '../../../utils/clean.js'

import { applyRule } from './apply.js'
import { addMoves } from './move.js'
import { getOpts } from './opts.js'
import { normalizeRule } from './rule.js'
import { list, set, remove } from './star_dot_path/main.js'
import { addWarnings, logWarnings } from './warn.js'

// Normalize configuration shape and do custom validation.
// An array of rule objects is passed.
// Each rule object applies validation and normalization on a specific
// configuration property.
// Users specify the operations order using the array order, as opposed to the
// library guessing the best order as this is simpler and more flexible. This:
//  - Allows going from child to parent or vice versa
//  - Removes the need to guess the order nor await other rules
//  - Removes the possibility of cycles
//  - Makes it clear to users what the order is
// TODO: abstract this function to its own library
export const normalizeConfigProps = async function (
  config,
  rules,
  { context = {}, soft = false, cwd, prefix, parent = '' } = {},
) {
  const rulesA = rules.map(normalizeRule)

  try {
    const { config: configB, warnings } = await pReduce(
      rulesA,
      (memo, rule) =>
        applyRuleDeep(memo, { rule, context, cwd, prefix, parent }),
      { config, moves: [], warnings: [] },
    )
    const value = cleanObject(configB)
    logWarnings(warnings, soft)
    return { value, warnings }
  } catch (error) {
    handleError(error, soft)
    return { error, warnings: [] }
  }
}

const applyRuleDeep = async function (
  { config, moves, warnings },
  { rule, rule: { name: query }, context, cwd, prefix, parent },
) {
  const props = list(config, query)
  return await pReduce(
    props,
    (memo, { value, query: name }) =>
      applyPropRule(memo, { value, name, rule, context, cwd, prefix, parent }),
    { config, moves, warnings },
  )
}

const applyPropRule = async function (
  { config, moves, warnings },
  { value, name, rule, rule: { example }, context, cwd, prefix, parent },
) {
  const opts = await getOpts({
    name,
    config,
    context,
    cwd,
    prefix,
    parent,
    example,
    moves,
  })
  const {
    value: newValue,
    name: newName = name,
    newNames = [],
    warnings: newWarnings,
  } = await applyRule(rule, value, opts)
  const configA = setConfigValue({ config, name, newName, newValue })
  const movesA = addMoves(moves, newNames, name)
  const warningsA = addWarnings(warnings, newWarnings)
  return { config: configA, moves: movesA, warnings: warningsA }
}

const setConfigValue = function ({ config, name, newName, newValue }) {
  const configA = name === newName ? config : remove(config, name)
  return newValue === undefined
    ? remove(configA, newName)
    : set(configA, newName, newValue)
}

// When in `sort` mode, user errors are returned instead of being thrown.
// System errors are always propagated.
const handleError = function (error, soft) {
  if (!soft || !error.validation) {
    throw error
  }
}
