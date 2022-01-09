import { listCombinations } from '../combination/list.js'
import { listHistory } from '../history/data/main.js'
import { createTopProps } from '../top/create.js'

// Create a new rawResult to measure
export const createResult = async function (config) {
  const [rawResult, history] = await Promise.all([
    createRawResult(config),
    listHistory(config),
  ])
  return { rawResult, history }
}

const createRawResult = async function (config) {
  const combinations = await listCombinations(config)
  const topProps = createTopProps(config)
  return { ...topProps, combinations }
}
