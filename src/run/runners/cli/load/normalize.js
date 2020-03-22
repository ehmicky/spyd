import { applyTemplate } from '../template.js'

// Apply templates in tasks and normalize their property names
export const normalizeTasks = function ({ tasks, variations }, variables) {
  const tasksA = tasks.map((task) => normalizeTask(task, variables))
  return { tasks: tasksA, variations }
}

const normalizeTask = function (
  { id, title, variations, main, before, after },
  variables,
) {
  const { taskId, taskTitle, variationsIds } = applyTaskTemplates({
    id,
    title,
    variations,
    variables,
  })
  return { taskId, taskTitle, variationsIds, main, before, after }
}

const applyTaskTemplates = function ({ id, title, variations, variables }) {
  const taskId = applyTemplate(id, variables)
  const taskTitle = applyTemplate(title, variables)

  if (variations === undefined) {
    return { taskId, taskTitle }
  }

  const variationsIds = variations.map((variation) =>
    applyTemplate(variation, variables),
  )
  return { taskId, taskTitle, variationsIds }
}
