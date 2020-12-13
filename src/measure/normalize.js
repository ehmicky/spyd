// The runner measures loops of the task. This retrieve the mean time to execute
// the task each time, from the time to execute the whole loop.
export const loopDurationsToMedians = function (loopDurations, repeat) {
  if (repeat === 1) {
    return loopDurations
  }

  // Somehow this is faster than direct mutation, providing `loopDurations` is
  // not used anymore after this function and can be garbage collected.
  return loopDurations.map((loopDuration) => loopDuration / repeat)
}
