import randomItem from 'random-item'

import { getBarrier } from './barrier.js'
import { getMinCombinations } from './time_spent.js'

export const waitForTurn = async function ({
  combination,
  combinations,
  loadBarrier,
}) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  combination.barrier = getBarrier()

  await waitForLoad(combinations, loadBarrier)

  resolveNext(combinations)
  await combination.barrier.promise
}

const waitForLoad = async function (combinations, loadBarrier) {
  if (loadBarrier.resolved) {
    return
  }

  if (isLoaded(combinations)) {
    loadBarrier.resolve()
    return
  }

  await loadBarrier.promise
}

const isLoaded = function (combinations) {
  return combinations.every(isLoadedCombination)
}

const isLoadedCombination = function ({ taskTitle }) {
  return taskTitle !== undefined
}

const resolveNext = function (combinations) {
  const minCombinations = getMinCombinations(combinations)
  const combination = randomItem(minCombinations)
  combination.barrier.resolve()
}
