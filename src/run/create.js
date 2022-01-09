import { listCombinations } from '../combination/list.js'
import { listHistory } from '../history/data/main.js'
import { normalizeId } from '../history/merge/id.js'
import { createTopProps } from '../top/create.js'

// Create a newResult to measure
export const createResult = async function (config) {
  const [newResult, history] = await Promise.all([
    createNewResult(config),
    listHistory(config),
  ])
  const newResultA = normalizeId(newResult, history)
  return { newResult: newResultA, history }
}

const createNewResult = async function (config) {
  const combinations = await listCombinations(config)
  const topProps = createTopProps(config)
  return { ...topProps, combinations }
}
