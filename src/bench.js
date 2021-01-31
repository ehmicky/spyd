import { v4 as uuidv4 } from 'uuid'

import { getCombinations } from './combination/main.js'
import { measureBenchmark } from './measure/main.js'
import { getFinalProps } from './measure/props.js'
import { mergeResults } from './normalize/merge.js'
import { getSystems } from './system/info.js'
import { cleanObject } from './utils/clean.js'

// Perform a new benchmark
export const performBenchmark = async function (config, results) {
  const { combinations, systemVersions } = await getCombinations(config)
  const { combinations: combinationsA, stopped } = await measureBenchmark(
    combinations,
    config,
  )
  const combinationsB = combinationsA.map(getFinalProps)
  const rawResult = addResultInfo(combinationsB, { systemVersions, config })
  const result = mergeResults(rawResult, results)
  return { rawResult, result, stopped }
}

// Add more information to the final result and normalize/sort it
const addResultInfo = function (
  combinations,
  { systemVersions, config: { envInfo } },
) {
  const id = uuidv4()
  const timestamp = Date.now()
  const systems = getSystems({ combinations, systemVersions, envInfo })
  const result = { id, timestamp, systems, combinations }
  const resultA = cleanObject(result)
  return resultA
}
