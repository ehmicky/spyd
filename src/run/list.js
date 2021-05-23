import { findTasks } from './find.js'
import { getTaskPaths } from './path.js'

// The tasks file for each runner is selected using the `runnerId.tasks`
// configuration property.
// The `tasks` can be used to specify a default tasks file for all runners.
// We allow it as a positional CLI flag:
//  - This is what many users would expect
//  - This allows users to do on-the-fly benchmarks without pre-existing setup
// The `tasks` are only needed when measuring them, not reporting them, so not
// all commands use it.
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
export const listTasks = async function (runners, cwd) {
  const tasksA = await Promise.all(
    runners.map((runner) => getRunnerTasks(runner, cwd)),
  )
  return tasksA.flat().filter(removeDuplicateTaskId)
}

const getRunnerTasks = async function (
  {
    runnerId,
    runnerSpawn,
    runnerSpawnOptions,
    runnerConfig,
    runnerConfig: { tasks },
    runnerExtensions,
  },
  cwd,
) {
  try {
    const taskPaths = await getTaskPaths(tasks, runnerExtensions, cwd)
    const taskPathsA = [...new Set(taskPaths)]
    const tasksA = await Promise.all(
      taskPathsA.map((taskPath) =>
        findTasks({
          taskPath,
          runnerId,
          runnerSpawn,
          runnerSpawnOptions,
          runnerConfig,
          cwd,
        }),
      ),
    )
    return tasksA.flat()
  } catch (error) {
    error.message = `In runner "${runnerId}": ${error.message}`
    throw error
  }
}

// When two task files export the same task id, we only keep one based on the
// following priority:
//  - `config.runner{Runner}.tasks` over `config.tasks`
//  - `tasks` array order
// This allows overridding tasks when using shared configurations.
const removeDuplicateTaskId = function (task, index, tasks) {
  return tasks.slice(index + 1).every(({ taskId }) => taskId !== task.taskId)
}
