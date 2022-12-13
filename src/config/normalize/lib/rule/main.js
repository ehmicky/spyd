import { inspect } from 'node:util'

import { DefinitionError } from '../error.js'

import { normalizeRule } from './normalize.js'
import { validateSerialRules } from './serial.js'

// Rules can be either:
//  - An array, run serially
//  - A Set, run in parallel
// Those can be nested.
// This validate and normalize this syntax.
// The syntax is chosen to:
//  - be simple
//  - be serial by default: parallelism requires explicit usage of `Set`
//  - allow rule to be a dependency of multiple rules
// Rules can depend on each other due to:
//  - `returnValue.input` from a rule with the same|parent `rule.name`
//  - `returnValue.move`
//  - `info.inputs`
//  - global state
// Most rules depend on either 0 or 1 other rule, not multiple rules
//  - Exception: when using `info.inputs` or global state, but this is less
//    frequent
//  - Multiple parent rules are only supported by the current syntax by running
//    each parent serially
export const normalizeRules = ({ rules, all, ruleProps, sync }) =>
  sync
    ? normalizeSerialRules(rules, all, ruleProps)
    : normalizeParallelRules(rules, all, ruleProps)

const normalizeSerialRules = (rules, all, ruleProps) => {
  validateSerialRules(rules)
  const items = rules.map((rule) =>
    normalizeRule({ rule, all, ruleProps, sync: true }),
  )
  return { items, parallel: false }
}

const normalizeParallelRules = (rules, all, ruleProps) => {
  const { items, parallel } = normalizeParallel(rules, all, ruleProps)
  validateTopRules(items, rules)
  return { items, parallel }
}

const normalizeParallel = (rules, all, ruleProps) => {
  if (Array.isArray(rules)) {
    return {
      items: normalizeNestedRules({ rules, all, ruleProps, parallel: false }),
      parallel: false,
    }
  }

  if (rules instanceof Set) {
    return {
      items: normalizeNestedRules({
        rules: [...rules],
        all,
        ruleProps,
        parallel: true,
      }),
      parallel: true,
    }
  }

  return {}
}

const normalizeNestedRules = ({ rules, all, ruleProps, parallel }) =>
  rules.reduce(
    (rulesA, rule) =>
      normalizeNestedRule({ rules: rulesA, rule, all, ruleProps, parallel }),
    [],
  )

// Nested rules of the same parallel|serial type are flattened to their parent
const normalizeNestedRule = ({ rules, rule, all, ruleProps, parallel }) => {
  const { items, parallel: nestedParallel } = normalizeParallel(
    rule,
    all,
    ruleProps,
  )

  if (items === undefined) {
    const ruleA = normalizeRule({ rule, all, ruleProps, sync: false })
    return [...rules, ruleA]
  }

  if (parallel === nestedParallel) {
    return [...rules, ...items]
  }

  return [...rules, { items, parallel: nestedParallel }]
}

const validateTopRules = (rules, originalRules) => {
  if (rules === undefined) {
    throw new DefinitionError(
      `Rules must be an array or a Set: ${inspect(originalRules)}`,
    )
  }
}
