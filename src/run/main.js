import { addToHistory } from '../history/data/main.js'
import {
  reportStart,
  reportCompute,
  reportPrint,
  reportEnd,
} from '../report/main.js'
import { normalizeRawResults } from '../report/normalize/raw.js'

import { measureCombinations } from './measure/main.js'
import { normalizeNewResult, updateCombinationsStats } from './normalize.js'
import { startPreview, endPreview } from './preview/start_end/main.js'

// Perform a new benchmark.
// There is no watch mode because:
//   - It would encourage user to perform actions while measuring is ongoing,
//     making it imprecise
//   - If file edit was not meant to start measuring, doing so would slow down
//     subsequent editing experience
//   - It would require either guessing imported files, or asking user to
//     specify them with a separate configuration property
export const performRun = async function ({
  newResult,
  history,
  previewState,
  config,
}) {
  const rawResult = normalizeNewResult(newResult)
  const { targetResult: result, history: historyA } = normalizeRawResults(
    rawResult,
    history,
    [],
  )
  const {
    result: resultA,
    sinceResult,
    noDimensions,
    config: configA,
  } = await reportStart(result, historyA, config)

  try {
    const { programmaticResult, contents } = await previewAndMeasure({
      newResult,
      result: resultA,
      sinceResult,
      noDimensions,
      previewState,
      config: configA,
    })
    await reportPrint(contents)
    return programmaticResult
  } finally {
    await reportEnd(configA)
  }
}

const previewAndMeasure = async function ({
  newResult,
  result,
  sinceResult,
  noDimensions,
  previewState,
  config,
  config: { cwd, precisionTarget, outliers },
}) {
  const previewStateA = await startPreview({
    newResult,
    result,
    sinceResult,
    noDimensions,
    previewState,
    config,
  })

  try {
    const combinations = await measureCombinations(newResult.combinations, {
      precisionTarget,
      cwd,
      previewState: previewStateA,
      outliers,
      stage: 'main',
      noDimensions,
    })
    const newResultA = { ...newResult, combinations }
    const rawResult = normalizeNewResult(newResultA)
    await addToHistory(rawResult, config)
    const resultA = updateCombinationsStats(result, combinations)
    const { programmaticResult, contents } = await reportCompute({
      result: resultA,
      sinceResult,
      noDimensions,
      config,
    })
    await endPreview(previewStateA)
    return { programmaticResult, contents }
  } catch (error) {
    await endPreview(previewStateA, error)
    throw error
  }
}
