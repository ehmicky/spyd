import pReduce from 'p-reduce'

import {
  startCombinationPreview,
  endCombinationPreview,
} from './preview_duration.js'
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
  { duration, cwd, previewConfig, previewState },
) {
  return await pReduce(
    combinations,
    (measuredCombinations, combination, index) =>
      measureCombinationStats({
        measuredCombinations,
        combination,
        index,
        duration,
        cwd,
        previewConfig,
        previewState,
      }),
    [],
  )
}

const measureCombinationStats = async function ({
  measuredCombinations,
  combination,
  index,
  duration,
  cwd,
  previewConfig,
  previewState,
}) {
  startCombinationPreview(previewState, duration, index + 1)
  const previewConfigA = { ...previewConfig, measuredCombinations }

  try {
    const { stats } = await measureCombination(combination, {
      duration,
      cwd,
      previewConfig: previewConfigA,
      previewState,
      stage: 'main',
    })
    return [...measuredCombinations, { ...combination, stats }]
  } finally {
    endCombinationPreview(previewState)
  }
}
