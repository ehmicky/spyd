import pReduce from 'p-reduce'
import { list } from 'wild-wild-path'

import { cleanObject } from '../../../utils/clean.js'

import { getInfo } from './info.js'
import { applyKeywords } from './keywords/main.js'
import { normalizeRules } from './normalize.js'
import { normalizeOpts } from './options.js'
import { logWarnings } from './warn.js'

// Validate and normalize a library's inputs.
// An array of rule objects is passed.
// Each rule object applies validation and normalization on a specific inputs
// property.
// Users specify the operations order using the array order, as opposed to the
// library guessing the best order as this is simpler and more flexible. This:
//  - Allows going from child to parent or vice versa
//  - Removes the need to guess the order nor await other rules
//  - Removes the possibility of cycles
//  - Makes it clear to users what the order is
// TODO: abstract this function to its own library
export const normalizeInputs = async function (inputs, rules, opts) {
  const { soft, all, keywords } = normalizeOpts(opts)
  const rulesA = normalizeRules(rules, all)

  try {
    const { inputs: inputsA, warnings } = await pReduce(
      rulesA,
      (memo, rule) => applyRuleDeep(memo, rule, keywords),
      { inputs, moves: [], warnings: [] },
    )
    const inputsB = cleanObject(inputsA)
    logWarnings(warnings, soft)
    return { inputs: inputsB, warnings }
  } catch (error) {
    handleError(error, soft)
    return { error, warnings: [] }
  }
}

const applyRuleDeep = async function (
  { inputs, moves, warnings },
  rule,
  keywords,
) {
  const entries = list(inputs, rule.name, {
    childFirst: true,
    sort: true,
    missing: true,
    entries: true,
  })
  return await pReduce(
    entries,
    (memo, { value, path }) =>
      applyEntryRule(memo, { input: value, path, rule, keywords }),
    { inputs, moves, warnings },
  )
}

// Apply rule for a specific entry
const applyEntryRule = async function (
  { inputs, moves, warnings },
  { input, path, rule, keywords },
) {
  const info = getInfo(path, inputs, moves)
  return await applyKeywords({
    rule,
    input,
    inputs,
    moves,
    warnings,
    info,
    keywords,
  })
}

// When in `sort` mode, user errors are returned instead of being thrown.
// System errors are always propagated.
const handleError = function (error, soft) {
  if (!soft || !error.validation) {
    throw error
  }
}
