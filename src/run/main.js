import {
  reportStart,
  reportCompute,
  reportPrint,
  reportEnd,
} from '../report/main.js'

import { createResult } from './create.js'
import { measureCombinations } from './measure/main.js'
import { normalizeMeasuredResult } from './normalize.js'
import {
  initPreview,
  startPreview,
  endPreview,
} from './preview/start_end/main.js'

// Perform a new benchmark.
// There is no watch mode because:
//   - It would encourage user to perform actions while measuring is ongoing,
//     making it imprecise
//   - If file edit was not meant to start measuring, doing so would slow down
//     subsequent editing experience
//   - It would require either guessing imported files, or asking user to
//     specify them with a separate configuration property
export const performRun = async function (config) {
  const previewState = initPreview(config)

  const { rawResult, history } = await createResult(config)
  const {
    result,
    history: historyA,
    noDimensions,
    config: configA,
  } = await reportStart(rawResult, history, config)

  try {
    const {
      result: { combinations },
      programmaticResult,
      contents,
    } = await previewAndMeasure({
      result,
      history: historyA,
      noDimensions,
      previewState,
      config: configA,
    })
    await reportPrint(contents)
    return { rawResult: { ...rawResult, combinations }, programmaticResult }
  } finally {
    await reportEnd(configA)
  }
}

const previewAndMeasure = async function ({
  result,
  history,
  noDimensions,
  previewState,
  config,
  config: { cwd, precisionTarget, outliers },
}) {
  const previewStateA = await startPreview({
    result,
    history,
    noDimensions,
    previewState,
    config,
  })

  try {
    const combinations = await measureCombinations(result.combinations, {
      precisionTarget,
      cwd,
      previewState: previewStateA,
      outliers,
      stage: 'main',
      noDimensions,
    })
    const resultA = normalizeMeasuredResult({ ...result, combinations })
    const { programmaticResult, contents } = await reportCompute({
      result: resultA,
      history,
      noDimensions,
      config,
    })
    await endPreview(previewStateA)
    return { result: resultA, programmaticResult, contents }
  } catch (error) {
    await endPreview(previewStateA, error)
    throw error
  }
}
