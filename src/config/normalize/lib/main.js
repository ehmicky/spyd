import pReduce from 'p-reduce'

import { cleanObject } from '../../../utils/clean.js'

import { applyRule } from './apply.js'
import { handleError } from './loose.js'
import { getOpts } from './opts.js'
import { list } from './prop_path/get.js'
import { set, remove } from './prop_path/set.js'
import { normalizeRule } from './rule.js'

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
  { context = {}, loose = false, cwd, prefix, parents = '' } = {},
) {
  const rulesA = rules.map(normalizeRule)

  try {
    const configB = await pReduce(
      rulesA,
      (configA, rule) =>
        applyRuleDeep({
          config: configA,
          rule,
          context,
          cwd,
          prefix,
          parents,
        }),
      config,
    )
    return cleanObject(configB)
  } catch (error) {
    handleError(error, loose)
    return error
  }
}

const applyRuleDeep = async function ({
  config,
  rule,
  rule: { name: query },
  context,
  cwd,
  prefix,
  parents,
}) {
  const props = Object.entries(list(config, query))
  return await pReduce(
    props,
    (configA, [name, value]) =>
      applyPropRule({
        config: configA,
        value,
        name,
        rule,
        context,
        cwd,
        prefix,
        parents,
      }),
    config,
  )
}

const applyPropRule = async function ({
  config,
  value,
  name,
  rule,
  rule: { example },
  context,
  cwd,
  prefix,
  parents,
}) {
  const opts = await getOpts({
    name,
    config,
    context,
    cwd,
    prefix,
    parents,
    example,
  })
  const { value: newValue, name: newName = name } = await applyRule(
    rule,
    value,
    opts,
  )
  const configA = name === newName ? config : remove(config, name)
  return newValue === undefined
    ? remove(configA, newName)
    : set(configA, newName, newValue)
}
