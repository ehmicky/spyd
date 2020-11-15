import { getDuration } from './duration.js'

// Main measuring code.
// If `repeat` is specified, we loop and perform an arithmetic mean.
export const measure = async function ({
  main,
  before,
  after,
  nowBias,
  loopBias = 0,
  repeat,
  async,
}) {
  const beforeArgs = await performBefore(before, repeat)

  const duration = await getDuration({ main, repeat, async, beforeArgs })

  await performAfter(after, repeat, beforeArgs)

  if (nowBias === undefined) {
    return duration
  }

  // The final time might be negative if the task is as fast or faster than the
  // iteration code itself. In this case, we return `0`.
  const time = Math.max((duration - nowBias) / repeat - loopBias, 0)
  return time
}

// Task `before()`. Performed outside measurements. Can be async.
// Its return value is passed to `main()` and `after()`.
const performBefore = async function (before, repeat) {
  if (before === undefined) {
    return
  }

  const beforeArgs = await Promise.all(
    Array.from({ length: repeat }, () => before()),
  )
  return beforeArgs
}

// Task `after()`. Performed outside measurements. Can be async.
const performAfter = async function (after, repeat, beforeArgs = []) {
  if (after === undefined) {
    return
  }

  await Promise.all(
    Array.from({ length: repeat }, (value, index) => after(beforeArgs[index])),
  )
}
