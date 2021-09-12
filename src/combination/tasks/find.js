import { isFile } from 'path-type'

import { PluginError, UserError } from '../../error/main.js'
import { measureCombinations } from '../../run/measure/main.js'

// Each task has its own process, in order to prevent them from influencing
// each other:
//  - By modifying the global state
//  - Or due to the runtime engine being less able to optimize hot paths due
//    to several tasks competing for optimization in the same process
// So we spawn a single process for all of them, to retrieve the task and step
// identifiers.
export const findTasks = async function (taskPath, cwd, runner) {
  await validateTask(taskPath)

  try {
    const [{ taskIds: ids }] = await measureCombinations(
      [{ dimensions: { runner }, taskPath, inputsList: [] }],
      { precisionTarget: 0, cwd, previewState: { quiet: true }, stage: 'init' },
    )
    validateDuplicateTaskIds(ids)
    return ids.map((id) => ({ id, taskPath, runner }))
  } catch (error) {
    error.message = `In tasks file "${taskPath}":\n${error.message}`
    throw error
  }
}

const validateTask = async function (taskPath) {
  if (!(await isFile(taskPath))) {
    throw new UserError(`Tasks file does not exist: ${taskPath}`)
  }
}

// Runners should enforce that task identifiers are unique. This can be done
// by using a syntax which does not allow duplicate keys such as exports
// in JavaScript.
// Using the same task id is allowed through in different:
//  - Runners: to compare the same task across runners
//  - Task files: to override shared configuration's tasks
const validateDuplicateTaskIds = function (ids) {
  const duplicateId = ids.find(isDuplicateId)

  if (duplicateId !== undefined) {
    throw new PluginError(
      `Task "${duplicateId}" must not be defined several times.`,
    )
  }
}

const isDuplicateId = function (id, index, ids) {
  return ids.slice(index + 1).includes(id)
}
