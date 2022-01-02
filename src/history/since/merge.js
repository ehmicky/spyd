import {
  removeResultCombinations,
  hasSameCombinations,
} from '../../combination/result.js'
import { mergeSystems } from '../../system/merge.js'

// The `merge` configuration property can be used to merge several results.
// This allows incremental benchmarks which is useful:
//  - When the benchmark uses different machines, e.g. in CI
//  - When the benchmark duration is long
// Merging applies not only to the `show|remove` commands but also to `run`:
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
//  - When this happens, we do not merge its systems
const mergeResult = function (result, previousResult) {
  if (hasSameCombinations(previousResult, result)) {
    return result
  }

  const resultA = mergeCombinations(result, previousResult)
  const resultB = mergeSystems(resultA, previousResult)
  return resultB
}

const mergeCombinations = function (result, previousResult) {
  const previousCombinations = removeResultCombinations(
    previousResult.combinations,
    result,
  )
  const combinations = [...result.combinations, ...previousCombinations]
  return { ...result, combinations }
}
