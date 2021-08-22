import {
  pickResultCombinations,
  removeResultCombinations,
} from '../combination/result.js'
import { mergeSystems } from '../system/merge.js'

// The `since` configuration property allows reporting several reports at once:
//  - This reports the most recent combination of each sets of dimensions
//  - This only uses the results up to the result targeted by `since`
//  - This allows incremental benchmarks
// This applies not only to the `show|remove` commands but also to `run`:
//  - This ensures `run` and `show` report the same result and behave the
//    same way
//  - This allows users to compare results while measuring, using a single
//    command as opposed to having to use `run` then `show`
//  - This focuses `show` command on its main purpose, i.e. historical viewing
//  - The `select` configuration property can be used if the user wants to diff
//    with a previous result but does not want adding the combinations of the
//    results in-between
//     - If the users want to use `select` to filter measuring but not
//       reporting, they should call `run` then `show` instead
// We explicitly avoid trying to guess the current set of dimensions beyond
// the current filtering properties because it is difficult.
//  - Instead, we just rely on the `since` delta
//  - All combination dimensions can be changed dynamically with
//    configuration properties. We cannot know whether missing combinations
//    were temporarily or permanently removed.
//  - This is especially true for systems. There is always only one system
//    per result. It is hard to know where/whether in the results history the
//    user intends to stop using each of the previously used systems.
export const mergeResults = function (result, previous) {
  return previous.reduceRight(mergeResult, result)
}

// Merge `previous` results to `result`, but only the combinations that exist
// in `baseResult`. Used when merging `sinceResult` with its previous results,
// while only keeping the combinations after `since`.
export const mergeFilteredResults = function (result, previous, baseResult) {
  return previous.reduceRight(
    mergeFilteredResult.bind(undefined, baseResult),
    pickResultCombinations(result, baseResult),
  )
}

// We short-circuit this function when the number of combinations indicates no
// more merging is possible, as a performance optimization when the number of
// results is high.
const mergeFilteredResult = function (baseResult, result, previousResult) {
  if (baseResult.combinations.length === result.combinations.length) {
    return result
  }

  const previousResultA = pickResultCombinations(previousResult, baseResult)
  return mergeResult(result, previousResultA)
}

// When merging two results, we keep most of the properties of the latest
// result.
//  - However, we still merge `system` so several systems are reported.
//  - This allows comparing different systems.
// We only merge results when there are some matching combinations
//  - For example, `result.systems` should only show systems from combinations
//    that have been merged, i.e. that are reported
export const mergeResult = function (result, previousResult) {
  const previousCombinations = removeResultCombinations(
    previousResult.combinations,
    result,
  )

  if (previousCombinations.length === 0) {
    return result
  }

  const combinations = [...result.combinations, ...previousCombinations]
  const systems = mergeSystems(result.systems, previousResult.systems)
  return { ...result, combinations, systems }
}
