import pReduce from 'p-reduce'

import {
  startCombinationPreview,
  endCombinationPreview,
} from '../preview/duration.js'

import { measureCombination } from './single.js'

// Measure all combinations and add results to `combinations`.
// Combinations are measured serially:
//  - Running them concurrently decreases the precision due to sharing the same
//    machine and OS. This is the case even when samples are run one at a time:
//     - Roughly doubles stdev
//     - Changes the distribution of each combination
//     - Increases `minLoopDuration` due to processes being spawned in parallel
//  - This lowers the maximum memory usage since only one combination's
//    `measures` is in memory at a time
//  - The downside is that users do not get early results of all combinations
//    at once. However, the `precision` configuration property can be used for
//    this.
export const measureCombinations = async function (
  combinations,
  { precisionTarget, cwd, previewState },
) {
  return await pReduce(
    combinations,
    (combinationsA, combination, index) =>
      measureCombinationStats({
        combinations: combinationsA,
        combination,
        index,
        previewState,
        precisionTarget,
        cwd,
      }),
    [],
  )
}

const measureCombinationStats = async function ({
  combinations,
  combination,
  index,
  previewState,
  precisionTarget,
  cwd,
}) {
  await startCombinationPreview(previewState, index)
  const { stats } = await measureCombination(combination, {
    precisionTarget,
    cwd,
    previewState,
    stage: 'main',
  })
  await endCombinationPreview(previewState)
  return [...combinations, { ...combination, stats }]
}
