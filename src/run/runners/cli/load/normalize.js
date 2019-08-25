import { applyTemplate } from '../template.js'

// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
export const normalizeTasks = function({ tasks, variations }, variables) {
  const tasksA = tasks.map(task => normalizeTask(task, variables))
  return { tasks: tasksA, variations }
}

const normalizeTask = function(
  { id, title, variations, main, before, after },
  variables,
) {
  const { taskTitle, variationsIds } = applyTaskTemplates({
    title,
    variations,
    variables,
  })
  return { taskId: id, taskTitle, variationsIds, main, before, after }
}

const applyTaskTemplates = function({ title, variations, variables }) {
  const taskTitle = applyTemplate(title, variables)

  if (variations === undefined) {
    return { taskTitle }
  }

  const variationsIds = variations.map(variation =>
    applyTemplate(variation, variables),
  )
  return { taskTitle, variationsIds }
}
