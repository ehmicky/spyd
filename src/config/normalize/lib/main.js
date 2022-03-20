import pReduce from 'p-reduce'

import { cleanObject } from '../../../utils/clean.js'

import { applyEntryRule } from './entry.js'
import { normalizeRules } from './rule.js'
import { logWarnings } from './warn.js'
import { list } from './wild_wild_path/main.js'

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
  { context = {}, soft = false, cwd, prefix, parent = [] } = {},
) {
  const rulesA = normalizeRules(rules)

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
  { rule, rule: { namePath }, context, cwd, prefix, parent },
) {
  const entries = list(config, namePath, {
    childFirst: true,
    sort: true,
    missing: true,
  })
  return await pReduce(
    entries,
    (memo, { value, path: namePathA }) =>
      applyEntryRule(memo, {
        value,
        namePath: namePathA,
        rule,
        context,
        cwd,
        prefix,
        parent,
      }),
    { config, moves, warnings },
  )
}

// When in `sort` mode, user errors are returned instead of being thrown.
// System errors are always propagated.
const handleError = function (error, soft) {
  if (!soft || !error.validation) {
    throw error
  }
}
