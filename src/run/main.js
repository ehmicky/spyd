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

  const { rawResult, previous } = await createResult(config)
  const {
    result,
    historyInfo,
    config: configA,
  } = await reportStart(rawResult, previous, config)

  try {
    const {
      result: { combinations },
      programmaticResult,
      contents,
    } = await previewAndMeasure({
      result,
      historyInfo,
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
  historyInfo,
  historyInfo: { noDimensions },
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
    const resultA = await measureResult({
      result,
      config,
      previewState: previewStateA,
      noDimensions,
    })
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

const measureResult = async function ({
  result,
  config: { cwd, precisionTarget },
  previewState,
  noDimensions,
}) {
  const combinations = await measureCombinations(result.combinations, {
    precisionTarget,
    cwd,
    previewState,
    stage: 'main',
    noDimensions,
  })
  const resultA = { ...result, combinations }
  const resultB = normalizeMeasuredResult(resultA)
  return resultB
}
