import randomItem from 'random-item'

import { getMinCombinations } from './time_spent.js'

export const waitForTurn = async function (combination, combinations) {
  combination.barriers.load.resolve()
  await waitForLoad(combinations)

  resolveNext(combinations)
  await combination.barriers.start.promise
}

const resolveNext = function (combinations) {
  const minCombinations = getMinCombinations(combinations)
  const combination = randomItem(minCombinations)
  combination.barriers.start.resolve()
}

// Wait until all `combinations[*].barriers.{type}` have resolved
export const waitForLoad = async function (combinations) {
  await Promise.all(combinations.map(getLoadBarrier))
}

const getLoadBarrier = function ({ barriers }) {
  return barriers.load.promise
}

// Retrieve a `barrier`, i.e. a promise that can be resolved manually
export const createBarrier = function () {
  // eslint-disable-next-line fp/no-let, init-declarations
  let resolveFunc
  // eslint-disable-next-line promise/avoid-new
  const promise = new Promise((resolve) => {
    // eslint-disable-next-line fp/no-mutation
    resolveFunc = resolve
  })
  return { promise, resolve: resolveFunc }
}
