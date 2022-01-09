import { addToHistory } from '../history/data/main.js'
import {
  reportStart,
  reportCompute,
  reportPrint,
  reportEnd,
} from '../report/main.js'

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
  const {
    result: resultA,
    sinceResult,
    noDimensions,
    config: configA,
  } = await reportStart(rawResult, history, { ...config, select: [] })

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
  config: { cwd, precision, outliers },
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
      precision,
      cwd,
      previewState: previewStateA,
      outliers,
      stage: 'main',
      noDimensions,
    })
    const rawResult = normalizeNewResult({ ...newResult, combinations })
    await addToHistory(rawResult, config)
    const { programmaticResult, contents } = await reportCompute({
      result: updateCombinationsStats(result, combinations),
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
