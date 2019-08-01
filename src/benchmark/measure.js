import { now } from '../now.js'

import { getDuration } from './duration.js'

// Main measuring code.
// If `repeat` is specified, we loop and perform an arithmetic mean.
export const measure = async function({
  main,
  before,
  after,
  nowBias,
  loopBias,
  repeat,
  isAsync,
}) {
  // When calculating `nowBias`
  if (main === undefined) {
    return -now() + now()
  }

  const beforeArgs = await performBefore(before, repeat)

  const duration = await getDuration({ main, repeat, isAsync, beforeArgs })

  await performAfter(after, repeat, beforeArgs)

  // The final time might be negative if the task is as fast or faster than the
  // iteration code itself. In this case, we return `0`.
  const time = Math.max((duration - nowBias) / repeat - loopBias, 0)
  return time
}

// Task `before()`. Performed outside measurements. Can be async.
// Its return value is passed to `main()` and `after()`.
const performBefore = async function(before, repeat) {
  if (before === undefined) {
    return
  }

  const promises = Array.from({ length: repeat }, () => before())
  const beforeArgs = await Promise.all(promises)
  return beforeArgs
}

// Task `after()`. Performed outside measurements. Can be async.
const performAfter = async function(after, repeat, beforeArgs = []) {
  if (after === undefined) {
    return
  }

  const promises = Array.from({ length: repeat }, (value, index) =>
    after(beforeArgs[index]),
  )
  await Promise.all(promises)
}
