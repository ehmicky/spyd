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
  startPreview,
  endPreview,
  printPreviewStarting,
} from './preview/start_end/main.js'
import { getPreviewState } from './preview/start_end/state.js'

// Perform a new benchmark.
// There is no watch mode because:
//   - It would encourage user to perform actions while measuring is ongoing,
//     making it imprecise
//   - If file edit was not meant to start measuring, doing so would slow down
//     subsequent editing experience
//   - It would require either guessing imported files, or asking user to
//     specify them with a separate configuration property
export const performRun = async function (config) {
  const previewState = getPreviewState(config)
  printPreviewStarting(previewState)

  const { result, previous } = await createResult(config)
  const {
    result: resultA,
    historyInfo,
    config: configA,
  } = await reportStart(result, previous, config)

  try {
    const {
      result: resultB,
      programmaticResult,
      contents,
    } = await previewAndMeasure({
      result: resultA,
      historyInfo,
      previewState,
      config: configA,
    })
    await reportPrint(contents)
    return { result: resultB, programmaticResult }
  } finally {
    await reportEnd(configA)
  }
}

const previewAndMeasure = async function ({
  result,
  historyInfo,
  previewState,
  config,
}) {
  const previewStateA = await startPreview({
    result,
    historyInfo,
    previewState,
    config,
  })

  try {
    const resultA = await measureResult(result, config, previewStateA)
    const { programmaticResult, contents } = await reportCompute(
      resultA,
      historyInfo,
      config,
    )
    await endPreview(previewStateA)
    return { result: resultA, programmaticResult, contents }
  } catch (error) {
    await endPreview(previewStateA, error)
    throw error
  }
}

const measureResult = async function (
  result,
  { cwd, precisionTarget },
  previewState,
) {
  const combinations = await measureCombinations(result.combinations, {
    precisionTarget,
    cwd,
    previewState,
    stage: 'main',
  })
  const resultA = { ...result, combinations }
  const resultB = normalizeMeasuredResult(resultA)
  return resultB
}
