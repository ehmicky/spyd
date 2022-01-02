import sortOn from 'sort-on'

import {
  removeResultCombinations,
  hasSameCombinations,
} from '../../combination/result.js'
import { cleanObject } from '../../utils/clean.js'
import { groupBy } from '../../utils/group.js'
import { pickLast } from '../../utils/last.js'
import { mergeSystems } from '../merge.js'

// Merge all results with the same `mergeId`.
// The `merge` configuration property can be used to merge several results.
// This allows incremental benchmarks which is useful:
//  - When the benchmark uses different machines, e.g. in CI
//  - When the benchmark duration is long
// We ask users to specify the mergeId:
//  - Instead of guessing it
//     - E.g. by merging combinations of previous results with lower priority
//  - Reasons:
//     - Merging would be less expected by users and create confusion
//        - E.g. when creating a new result, reporting already measured
//          combinations might be confusing
//        - So would reporting combinations of results before the `since` delta
//     - Whether a result should be reported as merged or not could be ambiguous
//        - Especially the first and last results in the history
//     - This would require loading files before resolving deltas
//     - This complicates the implementation
// Merging applies not only to the `show|remove` commands but also to `run|dev`:
//  - This ensures `run` and `show` report the same result and behave the
//    same way
//  - This allows users to see the merged result while measuring, using a single
//    command as opposed to having to use `run` then `show`
//  - This focuses `show` command on its main purpose, i.e. historical viewing
//  - The `select` configuration property can be used to tweak this behavior
// When merging two results, we keep most of the properties of the latest
// result.
//  - However, we still merge systems so several systems are reported.
//  - This allows comparing different systems.
// When an older result does not have any new combinations to merge, it is
// ignored
//  - When this happens, we do not merge its properties
// `rawResults` is already sorted by timestamp.
//  - However, grouping can remove this sorting order, so we sort again to
//    ensure the last result is still the target result
export const mergeResults = function (rawResults) {
  const resultsGroups = Object.values(groupBy(rawResults, getRawResultGroup))
  const rawResultsA = resultsGroups.map(mergeResultsGroup)
  const rawResultsB = sortOn(rawResultsA, 'timestamp')
  return rawResultsB
}

const getRawResultGroup = function ({ id, mergeId = id }) {
  return mergeId
}

const mergeResultsGroup = function (rawResults) {
  const [rawResultsA, lastRawResult] = pickLast(rawResults)
  return rawResultsA.reduceRight(mergeResultsPair, lastRawResult)
}

const mergeResultsPair = function (rawResult, previousRawResult) {
  if (hasSameCombinations(previousRawResult, rawResult)) {
    return rawResult
  }

  const rawResultA = mergeCombinations(rawResult, previousRawResult)
  const rawResultB = mergeSystems(rawResultA, previousRawResult)
  const rawResultC = mergeTopProps(rawResultB, previousRawResult)
  return rawResultC
}

const mergeCombinations = function (rawResult, previousRawResult) {
  const previousCombinations = removeResultCombinations(
    previousRawResult.combinations,
    rawResult,
  )
  const combinations = [...rawResult.combinations, ...previousCombinations]
  return { ...rawResult, combinations }
}

// `mergeId` are not persisted.
//  - If a group has at least one, the final group keeps it
//  - Otherwise, it remains undefined
// Unlike other properties, the oldest result has priority for `id`
//  - Like this, when merging a new result, the `id` of the group remains stable
//  - We do no not need to report multiple ids since users interact with the
//    whole group as if it was a single result with a single id
//  - However, the mergeId is still reported since users might want to know the
//    value for merging purpose
// For timestamps, we only keep the most recent one:
//  - I.e. when merging a new result, the timestamp of the group is updated
//  - This is what most users would expect
//  - The delta logic also follows this behavior
// We do not report:
//  - The benchmark's duration since some users might relate it to statistical
//    significance even though it is not
//  - Multiple timestamps because:
//     - It is too verbose
//     - Users might mistake it for the benchmark's duration
const mergeTopProps = function (
  rawResult,
  { id, mergeId = rawResult.mergeId },
) {
  return cleanObject({ ...rawResult, id, mergeId })
}
