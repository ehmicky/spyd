import pReduce from 'p-reduce'

import { cleanObject } from '../../../utils/clean.js'

import { getSkipCounts, applySkipCounts } from './condition.js'
import { applyDefinition } from './definitions.js'
import { list } from './prop_path/get.js'
import { parse } from './prop_path/parse.js'
import { set } from './prop_path/set.js'

// Normalize configuration shape and do custom validation.
// An array of definition objects is passed.
// Each definition object applies validation and normalization on a specific
// configuration property.
// Users specify the operations order using the array order, as opposed to the
// library guessing the best order as this is simpler and more flexible. This:
//  - Allows going from child to parent or vice versa
//  - Removes the need to guess the order nor await other definitions
//  - Removes the possibility of cycles
//  - Makes it clear to users what the order is
// TODO: abstract this function to its own library
export const normalizeConfigProps = async function (
  config,
  definitions,
  { context, loose = false },
) {
  const skipCounts = getSkipCounts(definitions)

  try {
    const { config: configA } = await pReduce(
      definitions,
      (memo, definition) => applyDefinitionDeep(memo, { definition, context }),
      { config, skipCounts },
    )
    const configB = cleanObject(configA)
    return configB
  } catch (error) {
    return handleError(error, loose)
  }
}

const applyDefinitionDeep = async function (
  { config, skipCounts },
  { definition, definition: { name: query }, context },
) {
  const props = Object.entries(list(config, query))
  const { config: configA, allSkipped } = await pReduce(
    props,
    (memo, [name, value]) =>
      applyPropDefinition(memo, { value, name, definition, context }),
    { config, allSkipped: true },
  )
  const { config: configB, skipCounts: skipCountsA } = applySkipCounts({
    config: configA,
    allSkipped,
    skipCounts,
    query,
  })
  return { config: configB, skipCounts: skipCountsA }
}

const applyPropDefinition = async function (
  { config, allSkipped },
  { value, name, definition, context },
) {
  const opts = getOpts(name, config, context)
  const { value: newValue, skipped } = await applyDefinition(
    definition,
    value,
    opts,
  )
  const configA = set(config, name, newValue)
  const allSkippedA = allSkipped && skipped
  return { config: configA, allSkipped: allSkippedA }
}

// Retrieve `opts` passed to most methods
const getOpts = function (name, config, context) {
  const path = getPath(name)
  return { name, path, config, context }
}

const getPath = function (name) {
  return parse(name).map(getPathKey)
}

const getPathKey = function ({ key }) {
  return key
}

// When in `loose` mode, user errors are returned instead of being thrown.
// System errors are always propagated.
const handleError = function (error, loose) {
  if (!loose || !error.validation) {
    throw error
  }

  return error
}
