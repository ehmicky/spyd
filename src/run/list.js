import { PluginError } from '../error/main.js'
import { measureBenchmark } from '../measure/main.js'

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
export const listTasks = async function ({ tasks, runners, cwd, duration }) {
  const tasksA = await Promise.all(
    runners.map((runner) => getRunnerTasks(runner, { tasks, cwd, duration })),
  )
  return [].concat(...tasksA)
}

const getRunnerTasks = async function (
  { runnerId, runnerSpawn, runnerSpawnOptions, runnerConfig, runnerExtensions },
  { tasks, cwd, duration },
) {
  try {
    const taskPath = await getTaskPath({
      tasks,
      runnerConfig,
      runnerExtensions,
      cwd,
    })
    const taskIds = await getTaskIds({
      taskPath,
      cwd,
      duration,
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

// A tasks file might have several tasks because:
//  - This is user-friendlier when using small tasks and/or single steps
//  - This prevents users using steps when they meant to use tasks
// Each task has its own process, in order to prevent them from influencing
// each other:
//  - By modifying the global state
//  - Or due to the runtime engine being less able to optimize hot paths due
//    to several tasks competing for optimization in the same process
// So we spawn a single process for all of them, to retrieve the task and step
// identifiers.
// Runners are encouraged to clearly separate task and step identifiers in tasks
// files. For example, not allowing users to concatenate them into a single
// identifiers. This makes it clearer for users which is which.
const getTaskIds = async function ({
  taskPath,
  cwd,
  duration,
  runnerSpawn,
  runnerSpawnOptions,
  runnerConfig,
}) {
  const {
    combinations: [{ tasks: taskIds }],
  } = await measureBenchmark(
    [{ taskPath, runnerSpawn, runnerSpawnOptions, runnerConfig, inputs: [] }],
    { progresses: [{ id: 'silent' }], cwd, duration },
  )
  validateDuplicateTaskIds(taskIds)
  return taskIds
}

// Runners should enforce that task identifiers are unique. This can be done
// by using a syntax which does not allow duplicate keys such as plain objects
// in JavaScript.
// Using the taskId in different runners is allowed though. This allows
// comparing the same task across runners.
const validateDuplicateTaskIds = function (taskIds) {
  const duplicateTaskId = taskIds.find(isDuplicateTaskId)

  if (duplicateTaskId !== undefined) {
    throw new PluginError(
      `Task "${duplicateTaskId}" must not be defined several times.`,
    )
  }
}

const isDuplicateTaskId = function (taskId, index, taskIds) {
  return taskIds.slice(index + 1).some((taskIdA) => taskId === taskIdA)
}
