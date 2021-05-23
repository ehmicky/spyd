import { isFile } from 'path-type'

import { PluginError, UserError } from '../error/main.js'
import { measureCombinations } from '../measure/several.js'

// A tasks file might have several tasks because:
//  - This is user-friendlier when using small tasks and/or single steps
//  - This prevents users using steps when they meant to use tasks
// There can optionally be several tasks files per runner because:
//  - This allows shared configurations' tasks to be overridden
//     - `select` can be used to exclude those instead
//  - This allows breaking down tasks files:
//     - This is faster when some tasks files are slow to load or have many
//       tasks
//     - This might be convenient by avoid big files when there are many tasks
//        - Not every file format can do this (e.g. with re-exports).
//          For example, this is possible in JavaScript but not in YAML.
//  - The downside is that users might mistakenly target dependent files instead
//    of main files. We document against it.
// Globbing patterns are allowed to help with this.
// We make the steps vs tasks distinction clear:
//  - Syntactically by requiring an additional depth level (nested object) for
//    steps
//  - We encourage tasks over steps
// Specifying an empty `tasks` array is allowed:
//  - This is useful when `tasks` is computed dynamically, or when requiring
//    `tasks` to be overridden by shared configuration's consumer or using CLI
//    flags
//  - However, if all runners have no tasks, an error will be thrown since there
//    won't be any combinations to measure
// Each task has its own process, in order to prevent them from influencing
// each other:
//  - By modifying the global state
//  - Or due to the runtime engine being less able to optimize hot paths due
//    to several tasks competing for optimization in the same process
// So we spawn a single process for all of them, to retrieve the task and step
// identifiers.
// Runners are encouraged to clearly separate task and step identifiers in tasks
// files.
//  - For example, not allowing users to concatenate them into a single
//    identifiers.
//  - This makes it clearer for users which is which.
export const findTasks = async function ({
  taskPath,
  runnerId,
  runnerSpawn,
  runnerSpawnOptions,
  runnerConfig,
  cwd,
}) {
  await validateTask(taskPath)
  const [{ taskIds }] = await measureCombinations(
    [{ taskPath, runnerSpawn, runnerSpawnOptions, runnerConfig, inputs: [] }],
    { precisionTarget: 0, cwd, previewState: { quiet: true }, stage: 'init' },
  )
  validateDuplicateTaskIds(taskIds)
  return taskIds.map((taskId) => ({
    taskId,
    taskPath,
    runnerId,
    runnerSpawn,
    runnerSpawnOptions,
    runnerConfig,
  }))
}

const validateTask = async function (taskPath) {
  if (!(await isFile(taskPath))) {
    throw new UserError(`Tasks file does not exist: ${taskPath}`)
  }
}

// Runners should enforce that task identifiers are unique. This can be done
// by using a syntax which does not allow duplicate keys such as plain objects
// in JavaScript.
// Using the same taskId is allowed through in different:
//  - Runners: to compare the same task across runners
//  - Task files: to override shared configuration's tasks
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
