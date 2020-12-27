import { measureCombinations } from './combination.js'
import { spawnProcesses } from './spawn.js'

// Each combination is spawned in its own process:
//  - This ensures runtime optimization is bound to each combination
//  - This allows runners with different programming languages
// We use a single long process per combination instead of spawning multiple
// ones:
//  - This would require setting a maximum duration or amount of measures. To
//    estimate those for different types of tasks is hard and brittle:
//      - Using hard-coded durations does not work since machines or tasks have
//        very different speeds
//      - Using the speed of the machine (by measuring the duration to spawn
//        process, start tasks, etc.) makes results vary based on non-obvious
//        factors. It is also hard to callibrate.
//      - Using the `duration` configuration property does not work when it is 0
//  - This would require starting both the runner and the task multiple times,
//    which wastes duration and does not allow runners with long initialization.
//  - Variance is higher due to task cold starts having a higher share of the
//    total measures.
export const runProcesses = async function ({
  combinations,
  origin,
  cwd,
  progressState,
  onOrchestratorError,
}) {
  const combinationsA = spawnProcesses({ combinations, origin, cwd })

  try {
    return await Promise.race([
      measureCombinations(combinationsA, progressState),
      onOrchestratorError,
    ])
  } finally {
    combinationsA.forEach(terminateProcess)
  }
}

// Terminate each runner's process at the end of the benchmark.
// In general, processes should already have exited thanks to error handling
// and cleanup logic. However, we terminate those as a safety precaution, for
// example if there is a bug.
const terminateProcess = function ({ childProcess }) {
  childProcess.kill('SIGKILL')
}
