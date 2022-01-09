import { listCombinations } from '../combination/list.js'
import { listHistory } from '../history/data/main.js'
import { normalizeRawResults } from '../history/normalize/load.js'
import { createTopProps } from '../top/create.js'
import { mergeSystemVersions } from '../top/system/versions/merge.js'

// Create a new rawResult to measure
export const createResult = async function (config) {
  const [rawResult, history] = await Promise.all([
    createRawResult(config),
    listHistory(config),
  ])
  const { targetResult: rawResultA, history: historyA } = normalizeRawResults(
    rawResult,
    history,
    config,
  )
  const rawResultB = mergeSystemVersions(rawResultA)
  return { rawResult: rawResultB, history: historyA }
}

const createRawResult = async function (config) {
  const combinations = await listCombinations(config)
  const topProps = createTopProps(config)
  return { ...topProps, combinations }
}
