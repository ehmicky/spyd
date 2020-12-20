import now from 'precise-now'
import randomItem from 'random-item'

// Retrieve the next combination which should be measured.
// We do it based on which combination are been measured the least.
// At the beginning, we pick them randomly, because it looks nicer.
export const getNextCombination = function (combinations, benchmarkEnd) {
  const remainingCombinations = getRemainingCombinations(
    combinations,
    benchmarkEnd,
  )

  if (remainingCombinations.length === 0) {
    return
  }

  const minCombinations = getMinCombinations(remainingCombinations)
  const combination = randomItem(minCombinations)
  return combination
}

// Filters out any combinations with no `duration` left
const getRemainingCombinations = function (combinations, benchmarkEnd) {
  const benchmarkDurationLeft = benchmarkEnd - now()
  return combinations.filter((combination) =>
    isRemainingCombination(combination, benchmarkDurationLeft),
  )
}

// `sampleDurationMean` is initially `undefined`. This ensures each combination
// measures at least once sample.
const isRemainingCombination = function (
  { state: { sampleDurationMean, loops } },
  benchmarkDurationLeft,
) {
  return (
    loops < MAX_LOOPS &&
    (sampleDurationMean === undefined ||
      sampleDurationMean < benchmarkDurationLeft)
  )
}

// We stop running samples when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8

const getMinCombinations = function (combinations) {
  const minCombinationDuration = getMinDuration(combinations)
  return combinations.filter(
    (combination) =>
      getCombinationDuration(combination) === minCombinationDuration,
  )
}

const getMinDuration = function (combinations) {
  return Math.min(...combinations.map(getCombinationDuration))
}

const getCombinationDuration = function ({ state: { combinationDuration } }) {
  return combinationDuration
}
