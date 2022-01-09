import { listCombinations } from '../combination/list.js'
import { listHistory } from '../history/data/main.js'
import { createTopProps } from '../top/create.js'

// Create a newResult to measure
export const createResult = async function (config) {
  const [newResult, history] = await Promise.all([
    createNewResult(config),
    listHistory(config),
  ])
  return { newResult, history }
}

const createNewResult = async function (config) {
  const combinations = await listCombinations(config)
  const topProps = createTopProps(config)
  return { ...topProps, combinations }
}
