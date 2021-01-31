import { getCombinations } from './combination/main.js'
import { getInitResult } from './measure/init.js'
import { measureBenchmark } from './measure/main.js'
import { getFinalProps } from './measure/props.js'
import { mergeResults } from './normalize/merge.js'
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

  const combinationsC = combinationsB.map(getFinalProps)
  const rawResult = { ...initResult, combinations: combinationsC }
  const result = mergeResults(rawResult, results)
  return { rawResult, result, stopped }
}
