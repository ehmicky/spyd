// The slowest times are due to external factors:
//   - OS or runtime background periodic processes (such as garbage collection)
//   - The first runs of a specific task in a given process are slow because
//     the runtimes did not optimize it yet
//   - The first processes have not reached the final stabilized `repeat` and
//     `maxDuration`, making them usually slower
export const removeOutlierTimes = function (times) {
  const outliersLimit = Math.ceil(times.length * (1 - OUTLIERS_THRESHOLD))
  const outliersMax = times[outliersLimit]
  const timesA = times.slice(0, outliersLimit)
  return { times: timesA, outliersMax }
}

// How many outliers to remove.
// A lower value removes fewer outliers, which increases variance.
// A higher value removes more times, which decreases accuracy.
const OUTLIERS_THRESHOLD = 0.15

// Remove initial `repeat` callibration
export const removeOutlierProcesses = function (results) {
  const repeatCallbrationIndex = results.findIndex(isRepeatCallibration)

  if (repeatCallbrationIndex === -1) {
    return results
  }

  return results.slice(repeatCallbrationIndex + 1)
}

const isRepeatCallibration = function ({ repeat }, index, results) {
  return (
    repeat === 1 &&
    index !== results.length - 1 &&
    results[index + 1].repeat !== 1
  )
}
