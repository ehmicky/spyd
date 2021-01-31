import { getCombinations } from './combination/main.js'
import { getInitResult, getFinalResult } from './measure/init.js'
import { measureBenchmark } from './measure/main.js'
import { aggregateMeasuresEnd } from './sample/aggregate.js'

// Perform a new benchmark
export const performBenchmark = async function (config, results) {
  const { combinations, systemVersions } = await getCombinations(config)
  const initResult = getInitResult({ combinations, systemVersions, config })
  const { combinations: combinationsA, stopped } = await measureBenchmark(
    combinations,
    config,
  )
  const combinationsB = combinationsA.map(aggregateMeasuresEnd)
  const { rawResult, result } = getFinalResult(
    combinationsB,
    initResult,
    results,
  )
  return { rawResult, result, stopped }
}
