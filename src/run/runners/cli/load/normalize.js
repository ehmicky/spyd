import { applyTemplate } from '../template.js'

// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
export const normalizeTasks = function({ variations, ...tasks }, variables) {
  const tasksA = Object.entries(tasks).map(([taskId, task]) =>
    normalizeTask({ taskId, task, variables }),
  )
  return { tasks: tasksA, variations }
}

const normalizeTask = function({
  taskId,
  task: { title, variations, main, before, after },
  variables,
}) {
  const { taskTitle, variationsIds } = applyTaskTemplates({
    title,
    variations,
    variables,
  })
  return { taskId, taskTitle, variationsIds, main, before, after }
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
