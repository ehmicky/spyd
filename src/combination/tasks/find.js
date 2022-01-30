import { PluginError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'
import { measureCombinations } from '../../run/measure/main.js'

// Each combination has its own process, in order to prevent them from
// influencing each other:
//  - By modifying the global state
//  - Or due to the runtime engine being less able to optimize hot paths due
//    to several combinations competing for optimization in the same process
// Before spawning those, we spawn a single process per task to retrieve the
// task and step identifiers.
export const findTasks = async function ({
  taskPath,
  runner,
  noDimensions,
  cwd,
}) {
  try {
    const [{ taskIds: ids }] = await measureCombinations(
      [{ dimensions: { runner }, taskPath, inputsList: [] }],
      {
        config: { precision: 0, cwd, outliers: true },
        previewState: { quiet: true },
        stage: 'init',
        noDimensions,
      },
    )
    validateDuplicateTaskIds(ids)
    return ids.map((id) => ({ id, taskPath, runner }))
  } catch (error) {
    throw wrapError(error, `In tasks file "${taskPath}":\n`)
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
