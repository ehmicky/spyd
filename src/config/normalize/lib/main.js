import { list } from 'wild-wild-path'

import { cleanObject } from '../../../utils/clean.js'

import { BaseError, UnknownError, InputError } from './error.js'
import { getInfo } from './info.js'
import { applyKeywords } from './keywords/main.js'
import { normalizeOpts } from './options.js'
import { normalizeRules } from './rule/main.js'
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
  const { soft, all, keywords, ruleProps, sync } = safeNormalizeOpts(opts)

  try {
    const rulesA = normalizeRules({ rules, all, ruleProps, sync })
    const state = { inputs, moves: [], warnings: [] }
    await applyRules({ rules: rulesA, state, keywords, sync })
    const { inputs: inputsA, warnings } = state
    const inputsB = cleanObject(inputsA)
    logWarnings(warnings, soft)
    return { inputs: inputsB, warnings }
  } catch (error) {
    return handleError(error, soft)
  }
}

const safeNormalizeOpts = function (opts) {
  try {
    return normalizeOpts(opts)
  } catch (error) {
    return handleError(error, false)
  }
}

const applyRules = async function ({
  rules: { items, parallel },
  state,
  keywords,
  sync,
}) {
  await (parallel
    ? applyParallelRules({ items, state, keywords, sync })
    : applySerialRules({ items, state, keywords, sync }))
}

// Parallel rules require sharing a common `state` object that is directly
// mutated.
const applyParallelRules = async function ({ items, state, keywords, sync }) {
  const resolutions = await Promise.allSettled(
    items.map((item) => applyRulesOrRule({ state, item, keywords, sync })),
  )
  handleFailedRule(resolutions)
}

// Instead of using `Promise.all()`, we wait for all parallel rules to complete
// with `Promise.allSettled()` and only throw the first failed rule, if any,
// to ensure exceptions are predictable.
const handleFailedRule = function (resolutions) {
  const failedRule = resolutions.find(isFailedRule)

  if (failedRule !== undefined) {
    throw failedRule.reason
  }
}

const isFailedRule = function ({ status }) {
  return status === 'rejected'
}

const applySerialRules = async function ({ items, state, keywords, sync }) {
  // eslint-disable-next-line fp/no-loops
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    await applyRulesOrRule({ state, item, keywords, sync })
  }
}

const applyRulesOrRule = async function ({ state, item, keywords, sync }) {
  await (item.name === undefined
    ? applyRules({ state, rules: item, keywords, sync })
    : applyRule({ state, rule: item, keywords, sync }))
}

const applyRule = async function ({
  state,
  state: { inputs },
  rule,
  keywords,
  sync,
}) {
  const entries = list(inputs, rule.name, LIST_OPTS)

  // eslint-disable-next-line fp/no-loops
  for (const { value: input, path } of entries) {
    const info = getInfo(path, state)
    // eslint-disable-next-line no-await-in-loop
    await applyKeywords({ rule, input, state, info, keywords, sync })
  }
}

const LIST_OPTS = { childFirst: true, sort: true, missing: true, entries: true }

// When in `sort` mode, input errors are returned instead of being thrown.
// Other errors are always propagated.
const handleError = function (error, soft) {
  const errorA = BaseError.normalize(error, UnknownError)

  if (soft && errorA instanceof InputError) {
    return { error: errorA, warnings: [] }
  }

  throw errorA
}
