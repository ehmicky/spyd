import { v4 as uuidv4 } from 'uuid'

import { getCombinations } from './combination/main.js'
import { measureCombinations } from './measure/main.js'
import { getStopState } from './measure/stop.js'
import { startProgress, endProgress } from './progress/start_end.js'
import { getSystem } from './system/info.js'
import { cleanObject } from './utils/clean.js'

// Perform a new benchmark
export const performBenchmark = async function (config) {
  const { combinations, systemVersions } = await getCombinations(config)

  const stopState = getStopState()
  const { progressState, progressId, onProgressError } = startProgress(
    combinations,
    config,
  )

  try {
    const result = await getResult({
      combinations,
      systemVersions,
      stopState,
      progressState,
      onProgressError,
      config,
    })
    return { result, stopped: stopState.stopped }
  } finally {
    await endProgress({ progressId, config })
  }
}

const getResult = async function ({
  combinations,
  systemVersions,
  stopState,
  progressState,
  onProgressError,
  config,
}) {
  const combinationsA = await measureCombinations({
    combinations,
    config,
    stopState,
    progressState,
    onProgressError,
  })
  const result = addResultInfo({
    combinations: combinationsA,
    systemVersions,
    config,
  })
  return result
}

// Add more information to the final result and normalize/sort it
const addResultInfo = function ({ combinations, systemVersions, config }) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()
  const system = getSystem({ combinations, systemVersions, config })
  const result = { id, timestamp, system, combinations }
  const resultA = cleanObject(result)
  return resultA
}
