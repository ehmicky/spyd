// Retrieve a `barrier`, i.e. a promise that can be resolved manually
export const getBarrier = function () {
  // eslint-disable-next-line fp/no-let, init-declarations
  let resolveFunc
  // eslint-disable-next-line promise/avoid-new
  const promise = new Promise((resolve) => {
    // eslint-disable-next-line fp/no-mutation
    resolveFunc = resolve
  })
  const barrier = { promise, resolved: false }
  // eslint-disable-next-line fp/no-mutation
  barrier.resolve = barrierResolve.bind(undefined, barrier, resolveFunc)
  return barrier
}

const barrierResolve = function (barrier, resolveFunc) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  barrier.resolved = true
  resolveFunc()
}
