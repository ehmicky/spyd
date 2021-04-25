import { getCombinationName } from '../combination/ids.js'
import { measureCombinations } from '../measure/several.js'

// Execute tasks without benchmarking them.
// We run each serially, so the output is not interleaved.
export const performExec = async function (config, combinations) {
  // eslint-disable-next-line fp/no-loops
  for (const combination of combinations) {
    // eslint-disable-next-line no-await-in-loop
    await execCombination(combination, config)
  }
}

export const execCombination = async function (combination, { cwd }) {
  printCombinationName(combination)

  await measureCombinations([combination], {
    precisionTarget: 0,
    cwd,
    previewState: { quiet: true },
    stage: 'exec',
  })
}

// Print the ids of each combination before running them, so users can
// visually separate their output
const printCombinationName = function (combination) {
  const combinationName = getCombinationName(combination)
  // eslint-disable-next-line no-restricted-globals, no-console
  console.log(combinationName)
}
