// Select tasks according to the `tasks` option (if specified)
export const selectTaskIds = function(iterations, taskIds) {
  if (taskIds === undefined) {
    return iterations
  }

  taskIds.forEach(taskId => validateTaskId(iterations, taskId))

  return iterations.filter(iteration => isSelected(iteration, taskIds))
}

const validateTaskId = function(iterations, taskId) {
  if (!hasTaskId(iterations, taskId)) {
    throw new Error(`Selected task '${taskId}' but that task does not exist`)
  }
}

const hasTaskId = function(iterations, taskId) {
  return iterations.some(iteration => iteration.taskId === taskId)
}

const isSelected = function(iteration, taskIds) {
  return taskIds.some(taskId => taskId === iteration.taskId)
}
