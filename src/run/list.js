import { findTasks } from './find.js'
import { getTaskPath } from './path.js'

// The tasks file for each runner is selected using the `runnerId.tasks`
// configuration property.
// The `tasks` can be used to specify a default tasks file for all runners.
// We allow it as a positional CLI flag:
//  - This is what many users would expect
//  - This allows users to do on-the-fly benchmarks without pre-existing setup
// The `tasks` are only needed when measuring them, not reporting them, so not
// all commands use it.
// We do not allow specifying several tasks files per runner. This allows making
// it clearer that only entry files must be specified. Otherwise, confusing
// errors might happen when users specified non-entry files.
// Runners are specified using the `runner` configuration property. Other
// solutions have problems:
//  - using code comment:
//     - this requires reading files, which is slow with big files
//     - transpiling might remove code comments
//     - this does not work in compiled binaries
//  - using the task filenames:
//     - this does not allow multiple runners per task
//     - this leads to odd filenames when the runner and file extension are
//       similar or the same
//  - looking into `package.json` or `node_modules` for all the installed
//    runners
//     - too implicit/magic
//     - this might give false positives, especially due to nested dependencies
//     - this does not work well with bundled runners
export const listTasks = async function ({ tasks, runners, cwd }) {
  const tasksA = await Promise.all(
    runners.map((runner) => getRunnerTasks(runner, { tasks, cwd })),
  )
  return [].concat(...tasksA)
}

const getRunnerTasks = async function (
  { runnerId, runnerSpawn, runnerSpawnOptions, runnerConfig, runnerExtensions },
  { tasks, cwd },
) {
  try {
    const taskPath = await getTaskPath({
      tasks,
      runnerConfig,
      runnerExtensions,
      cwd,
    })
    const taskIds = await findTasks({
      taskPath,
      cwd,
      runnerSpawn,
      runnerSpawnOptions,
      runnerConfig,
    })
    return taskIds.map((taskId) => ({ taskId, taskPath, runnerId }))
  } catch (error) {
    error.message = `In runner "${runnerId}": ${error.message}`
    throw error
  }
}
