import { performance } from 'perf_hooks'

// Measure how long a function takes to execute
export const measure = function(func) {
  const start = performance.now()
  const returnValue = func()
  // We measure synchronous time right away, because checking if `returnValue`
  // is a promise takes some CPU cycles
  const end = performance.now()

  if (!(returnValue instanceof Promise)) {
    return end - start
  }

  // eslint-disable-next-line promise/prefer-await-to-then
  return returnValue.then(() => {
    const asyncEnd = performance.now()
    return asyncEnd - start
  })
}
