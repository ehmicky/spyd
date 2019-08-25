import { applyTemplate } from '../template.js'

// `taskTitle` defaults to the function variable name. `taskTitle` is used by
// reporters while the `taskId` is used for identification.
export const normalizeTasks = function({
  entries: { variations, shell = DEFAULT_SHELL, ...tasks },
  taskPath,
  variables,
}) {
  const tasksA = Object.entries(tasks).map(([taskId, task]) =>
    normalizeTask({ taskId, task, taskPath, variables }),
  )
  const shellA = getShell({ shell, variables })
  return { tasks: tasksA, variations, shell: shellA }
}

const normalizeTask = function({
  taskId,
  task: { title, variations, main, before, after },
  taskPath,
  variables,
}) {
  const { taskTitle, variationsIds } = applyTaskTemplates({
    title,
    variations,
    variables,
  })
  return { taskPath, taskId, taskTitle, variationsIds, main, before, after }
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

// `shell` can contain variables, i.e. can be a string 'true' or 'false'
const getShell = function({ shell = DEFAULT_SHELL, variables }) {
  if (typeof shell === 'boolean') {
    return shell
  }

  const shellA = applyTemplate(shell, variables)
  return shellA === 'true'
}

const DEFAULT_SHELL = true
