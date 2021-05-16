import { normalizeMeasuredResult } from '../normalize/result.js'
import {
  startPreview,
  endPreview,
  printPreviewStarting,
} from '../preview/start_end.js'
import {
  reportStart,
  reportCompute,
  reportPrint,
  reportEnd,
} from '../report/main.js'

import { createResult } from './create.js'
import { measureCombinations } from './several.js'

// Perform a new benchmark.
// There is no watch mode because:
//   - It would encourage user to perform actions while measuring is ongoing,
//     making it imprecise
//   - If file edit was not meant to start measuring, doing so would slow down
//     subsequent editing experience
//   - It would require either guessing imported files, or asking user to
//     specify them with a separate configuration property
export const performBenchmark = async function (config) {
  printPreviewStarting(config)

  const { result, previous } = await createResult(config)
  const { config: configA, result: resultA } = await reportStart(
    result,
    previous,
    config,
  )

  try {
    const {
      result: resultB,
      finalResult,
      contents,
    } = await previewAndMeasure(resultA, configA)
    await reportPrint(contents)
    return { result: resultB, finalResult }
  } finally {
    await reportEnd(configA)
  }
}

const previewAndMeasure = async function (result, config) {
  const previewState = await startPreview(result, config)

  try {
    const resultA = await measureResult(result, config, previewState)
    const { finalResult, contents } = await reportCompute(resultA, config)
    await endPreview(previewState)
    return { result: resultA, finalResult, contents }
  } catch (error) {
    await endPreview(previewState, error)
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
