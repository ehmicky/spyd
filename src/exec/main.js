import { getCombinationIds } from '../combination/ids.js'
import { measureBenchmark } from '../measure/main.js'
import { titleColor } from '../report/utils/colors.js'
import { SEPARATOR_SIGN } from '../report/utils/separator.js'

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
  printCombinationIds(combination)

  await measureBenchmark([combination], {
    cwd,
    duration: 1,
    exec: true,
    previewConfig: { quiet: true },
    previewState: {},
  })
}

// Print the ids of each combination before running them, so users can
// visually separate their output
const printCombinationIds = function (combination) {
  const ids = getCombinationIds(combination)
  const idsStr = titleColor(ids.join(` ${SEPARATOR_SIGN} `))
  // eslint-disable-next-line no-restricted-globals, no-console
  console.log(idsStr)
}
