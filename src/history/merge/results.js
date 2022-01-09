import omit from 'omit.js'
import sortOn from 'sort-on'

import { addDefaultIds } from '../../combination/default.js'
import {
  removeSameCombinations,
  hasSameCombinations,
} from '../../combination/result.js'
import { groupBy } from '../../utils/group.js'
import { pickLast } from '../../utils/last.js'

// Merge all rawResults with the same `id`.
// The `merge` configuration property sets the result's `id`, which can be used
// to merge several results.
// This allows incremental benchmarks which is useful:
//  - When the benchmark uses different machines, e.g. in CI
//  - When the benchmark duration is long
// Either:
//  - The result's id is from an already measured result, in which case it can
//    be reported to users by `run|show`
//  - Several results are run in parallel, e.g. in CI
//     - In that case, a UUID v3|v5 based on the CI build's information can be
//       used.
//     - Alternatively, a UUID v4 can be passed to all CI jobs, but this
//       requires message passing.
// We re-use the result's `id`:
//  - Which is already used to identify a result for deltas
//  - As opposed to using a separate identifier, because this is simpler to
//    understand
// We ask users to specify the `id` if they want to merge results:
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
// Merging applies not only to the `show|remove` commands but also to `run`:
//  - This ensures `run` and `show` report the same result and behave the
//    same way
//  - This allows users to see the merged result while measuring, using a single
//    command as opposed to having to use `run` then `show`
//  - This focuses `show` command on its main purpose, i.e. historical viewing
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
export const mergeResults = function (history, targetResult) {
  const rawResultsGroups = Object.values(
    groupBy([...history, targetResult], 'id'),
  )
  const results = rawResultsGroups.map(mergeRawResultsGroup)
  const resultsA = sortOn(results, 'timestamp')
  const [historyA, targetResultB] = pickLast(resultsA)
  return { history: historyA, targetResult: targetResultB }
}

const mergeRawResultsGroup = function (rawResults) {
  const rawResultsA = rawResults.map(omitUnmergedProps)
  const [rawResultsB, lastRawResult] = pickLast(rawResultsA)
  return rawResultsB.reduceRight(mergeResultsPair, lastRawResult)
}

// `subId` should be merged as an array of `subIds`. However, since it is not
// used except for filenames at the moment, we just omit it.
const omitUnmergedProps = function (rawResult) {
  return omit.default(rawResult, UNMERGED_PROPS)
}

const UNMERGED_PROPS = ['subId']

// When merging timestamps, we only keep the most recent one:
//  - I.e. when merging a new result, the timestamp of the group is updated
//  - This is what most users would expect
//  - The delta logic also follows this behavior
// We do not report:
//  - The benchmark's duration since some users might relate it to statistical
//    significance even though it is not
//  - Multiple timestamps because:
//     - It is too verbose
//     - Users might mistake it for the benchmark's duration
const mergeResultsPair = function (rawResult, previousRawResult) {
  const [rawResultA, previousRawResultA] = mergeDimensions(
    rawResult,
    previousRawResult,
  )

  if (hasSameCombinations(previousRawResultA, rawResultA)) {
    return rawResultA
  }

  const rawResultB = mergeCombinations(rawResultA, previousRawResultA)
  return rawResultB
}

// Either rawResult might be missing some dimensions from the other one
// We add default ids to ensure:
//  - Both results' combinations can be compared
//  - The merged result has all dimensions
const mergeDimensions = function (rawResult, previousRawResult) {
  return addDefaultIds(
    [rawResult, previousRawResult],
    [...rawResult.combinations, ...previousRawResult.combinations],
  )
}

const mergeCombinations = function (rawResult, previousRawResult) {
  const previousCombinations = removeSameCombinations(
    previousRawResult.combinations,
    rawResult.combinations,
  )
  const combinations = [...rawResult.combinations, ...previousCombinations]
  return { ...rawResult, combinations }
}

// Retrieve all rawResults part of the merged targetResult
export const getTargetRawResults = function (targetResult, history) {
  const historyA = history.filter(({ id }) => id === targetResult.id)
  return [...historyA, targetResult]
}
