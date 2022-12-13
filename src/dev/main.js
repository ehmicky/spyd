import { getNoDimensions } from '../combination/filter.js'
import { getCombinationNameColor } from '../combination/ids/name.js'
import { measureCombinations } from '../run/measure/main.js'

// Execute tasks without benchmarking them.
// We run each serially, so the output is not interleaved.
export const performDev = async (combinations, config) => {
  const noDimensions = getNoDimensions(combinations)

  // eslint-disable-next-line fp/no-loops
  for (const combination of combinations) {
    // eslint-disable-next-line no-await-in-loop
    await combinationDev(combination, noDimensions, config)
  }
}

const combinationDev = async (combination, noDimensions, { cwd }) => {
  printCombinationName(combination, noDimensions)

  await measureCombinations([combination], {
    config: { precision: 0, cwd, outliers: true },
    previewState: { quiet: true },
    stage: 'dev',
    noDimensions,
  })
}

// Print the ids of each combination before running them, so users can
// visually separate their output
const printCombinationName = (combination, noDimensions) => {
  const combinationNameColor = getCombinationNameColor(
    combination,
    noDimensions,
  )

  if (combinationNameColor === '') {
    return
  }

  // eslint-disable-next-line no-restricted-globals, no-console
  console.log(combinationNameColor)
}
