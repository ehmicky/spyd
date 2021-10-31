export const getSamples = function (
  length,
  period,
  stdevA,
  meanA,
  stdevB,
  meanB,
) {
  const samples = new Array(length)

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < length; index += period) {
    const secondValue = getNormalRandom(stdevB, meanB)
    const endIndex = Math.min(index + period, length)

    // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
    for (let secondIndex = index; secondIndex < endIndex; secondIndex += 1) {
      samples[secondIndex] = secondValue * getNormalRandom(stdevA, meanA)
    }
  }

  return samples
}

const getNormalRandom = function (stdev, mean) {
  return (
    Math.sqrt(-2 * Math.log(Math.random())) *
      Math.cos(Math.PI * 2 * Math.random()) *
      stdev +
    mean
  )
}
