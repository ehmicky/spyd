import { listHistory } from '../history/main.js'
import { getInitResult, getFinalResult } from '../normalize/init.js'
import { initPreview } from '../preview/init.js'
import { updatePreviewReport } from '../preview/results.js'
import { startPreview, endPreview } from '../preview/start_end.js'

import { measureCombinations } from './several.js'

// Perform a new benchmark.
// There is no watch mode because:
//   - It would encourage user to perform actions while measuring is ongoing,
//     making it imprecise
//   - If file edit was not meant to start measuring, doing so would slow down
//     subsequent editing experience
//   - It would require either guessing imported files, or asking user to
//     specify them with a separate configuration property
export const performBenchmark = async function (
  config,
  combinations,
  systemVersions,
) {
  const initResult = getInitResult({ combinations, systemVersions, config })
  const {
    combinations: combinationsA,
    previous,
    history,
  } = await previewStartAndMeasure({ combinations, config, initResult })
  const { rawResult, result } = getFinalResult({
    combinationsA,
    initResult,
    previous,
    history,
  })
  return { rawResult, result }
}

const previewStartAndMeasure = async function ({
  combinations,
  config,
  initResult,
}) {
  const previewState = initPreview(initResult, config, combinations)
  await startPreview(previewState)

  try {
    await updatePreviewReport(previewState)

    const returnValue = await listHistoryAndMeasure({
      combinations,
      config,
      previewState,
    })
    await endPreview(previewState)
    return returnValue
  } catch (error) {
    await endPreview(previewState, error)
    throw error
  }
}

const listHistoryAndMeasure = async function ({
  combinations,
  config,
  config: { cwd, precisionTarget },
  previewState,
}) {
  const { previous, history } = await listHistory(config)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, { previous, history })

  const combinationsA = await measureCombinations(combinations, {
    precisionTarget,
    cwd,
    previewState,
    stage: 'main',
  })
  return { combinations: combinationsA, previous, history }
}
