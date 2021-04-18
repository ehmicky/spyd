import { PluginError } from '../error/main.js'
import { measureCombination } from '../measure/single.js'

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
export const findTasks = async function ({
  taskPath,
  cwd,
  runnerSpawn,
  runnerSpawnOptions,
  runnerConfig,
}) {
  const { taskIds } = await measureCombination(
    { taskPath, runnerSpawn, runnerSpawnOptions, runnerConfig, inputs: [] },
    {
      precisionTarget: 0,
      cwd,
      previewConfig: { quiet: true },
      previewState: {},
      stage: 'init',
    },
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
  return taskIds.slice(index + 1).includes(taskId)
}
