import { listHistory } from '../history/main.js'
import { getInitResult, getFinalResult } from '../normalize/init.js'
import { initPreview } from '../preview/init.js'
import { updatePreviewResults } from '../preview/results.js'
import { startPreview, endPreview } from '../preview/start_end.js'

import { measureCombinations } from './several.js'

// Perform a new benchmark
export const performBenchmark = async function (
  config,
  combinations,
  systemVersions,
) {
  const initResult = getInitResult({ combinations, systemVersions, config })
  const {
    combinations: combinationsA,
    results,
  } = await previewStartAndMeasure({ combinations, config, initResult })
  const { rawResult, result } = getFinalResult(
    combinationsA,
    initResult,
    results,
  )
  return { rawResult, result }
}

// Start preview then measure benchmark
const previewStartAndMeasure = async function ({
  combinations,
  config,
  initResult,
}) {
  const previewState = initPreview(initResult, config, combinations)
  await startPreview(previewState)

  try {
    await updatePreviewResults(previewState)

    const {
      combinations: combinationsA,
      results,
    } = await previewRefreshAndMeasure({ combinations, config, previewState })
    await endPreview(previewState)
    return { combinations: combinationsA, results }
  } catch (error) {
    await endPreview(previewState, error)
    throw error
  }
}

// Start preview refresh then measure benchmark
const previewRefreshAndMeasure = async function ({
  combinations,
  config,
  config: { cwd, precisionTarget },
  previewState,
}) {
  const results = await listHistory(config)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.results = results

  const combinationsA = await measureCombinations(combinations, {
    precisionTarget,
    cwd,
    previewState,
  })
  return { combinations: combinationsA, results }
}
