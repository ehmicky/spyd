import { groupBy } from '../../../utils/group.js'
import { mapValues } from '../../../utils/map.js'

import { callValueFunc } from './call.js'
import { remove } from './prop_path/set.js'

// Apply `condition(value, opts)` which skips the current definition if `false`
// is returned.
export const againstCondition = async function (value, condition, opts) {
  return (
    condition !== undefined && !(await callValueFunc(condition, value, opts))
  )
}

// `condition(value, opts)` has two purposes:
//  - Applying different definitions for a given property based on a condition
//  - Skipping specific properties based on a condition
//     - For example, when several commands share some properties but not all
// For the second purpose, we remove properties when all their `condition()`
// return `false`.
// We do this by:
//  - Counting how many definitions each query has
//  - Decrementing that count each time all `condition()` of a given property
//    (including wildcard iteration) return `false`
//  - Removing the property if that count is 0
export const getSkipCounts = function (definitions) {
  return mapValues(groupBy(definitions, 'name'), getSkipCount)
}

const getSkipCount = function (definitions) {
  return definitions.length
}

export const applySkipCounts = function ({
  config,
  allSkipped,
  skipCounts,
  query,
}) {
  if (!allSkipped) {
    return { config, skipCounts }
  }

  const skipCount = skipCounts[query] - 1
  const skipCountsA = { ...skipCounts, [query]: skipCount }
  const configA = skipCount === 0 ? remove(config, query) : config
  return { config: configA, skipCounts: skipCountsA }
}
