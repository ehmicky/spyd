// taskId is `undefined` during init
export const prependTaskPrefix = function (error, { taskId }) {
  if (taskId === undefined) {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}
