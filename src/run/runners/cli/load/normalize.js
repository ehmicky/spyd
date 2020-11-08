import { applyTemplate } from '../template.js'

// Apply templates in tasks and normalize their property names
export const normalizeTasks = function ({ tasks, inputs }, variables) {
  const tasksA = tasks.map((task) => normalizeTask(task, variables))
  return { tasks: tasksA, inputs }
}

const normalizeTask = function (
  { id, title, inputs, main, before, after },
  variables,
) {
  const { taskId, taskTitle, inputsIds } = applyTaskTemplates({
    id,
    title,
    inputs,
    variables,
  })
  return { taskId, taskTitle, inputsIds, main, before, after }
}

const applyTaskTemplates = function ({ id, title, inputs, variables }) {
  const taskId = applyTemplate(id, variables)
  const taskTitle = applyTemplate(title, variables)

  if (inputs === undefined) {
    return { taskId, taskTitle }
  }

  const inputsIds = inputs.map((input) => applyTemplate(input, variables))
  return { taskId, taskTitle, inputsIds }
}
