// eslint-disable-next-line n/file-extension-in-import, import/no-unassigned-import
import 'error-cause/auto'

import { listCombinations } from './combination/list.js'
import { getConfig } from './config/main.js'
import { performDev } from './dev/main.js'
import { ErrorTypes } from './error/main.js'
import { mergeErrorCause } from './error/merge/main.js'
import { allowErrorTypes } from './error/types.js'
import { checkLimits } from './history/compare/limit.js'
import { getFromHistory, removeFromHistory } from './history/data/main.js'
import { getTargetRawResults } from './history/merge/results.js'
import { reportResult } from './report/main.js'
import { createResult } from './run/create.js'
import { performRun } from './run/main.js'
// eslint-disable-next-line import/max-dependencies
import { initPreview } from './run/preview/start_end/main.js'

// Measure code defined in a tasks file and report the results.
// Default command.
export const run = async function (configFlags) {
  try {
    const config = await getConfig('run', configFlags)
    const previewState = initPreview(config)
    const { newResult, history } = await createResult(config)
    const programmaticResult = await performRun({
      newResult,
      history,
      previewState,
      config,
    })
    checkLimits(programmaticResult)
    return programmaticResult
  } catch (error) {
    throw allowErrorTypes(mergeErrorCause(error), ErrorTypes)
  }
}

// Show a previous result
export const show = async function (configFlags) {
  try {
    const config = await getConfig('show', configFlags)
    const { rawResult, history } = await getFromHistory(config)
    const programmaticResult = await reportResult(rawResult, history, config)
    checkLimits(programmaticResult)
    return programmaticResult
  } catch (error) {
    throw allowErrorTypes(mergeErrorCause(error), ErrorTypes)
  }
}

// Remove a previous result
export const remove = async function (configFlags) {
  try {
    const config = await getConfig('remove', configFlags)
    const { rawResult, history } = await getFromHistory(config)
    const targetRawResults = getTargetRawResults(rawResult, history)
    const programmaticResult = await reportResult(rawResult, history, config)
    await removeFromHistory(targetRawResults, config)
    return programmaticResult
  } catch (error) {
    throw allowErrorTypes(mergeErrorCause(error), ErrorTypes)
  }
}

// Execute tasks without benchmarking them
export const dev = async function (configFlags) {
  try {
    const config = await getConfig('dev', configFlags)
    const combinations = await listCombinations(config)
    await performDev(combinations, config)
  } catch (error) {
    throw allowErrorTypes(mergeErrorCause(error), ErrorTypes)
  }
}
