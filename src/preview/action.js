// Add|remove available user actions shown in preview
export const addAction = function (previewState, action) {
  if (previewState.quiet) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.actions = [
    ...filterAction(previewState.actions, action.name),
    action,
  ]
}

export const removeAction = function (previewState, name) {
  if (previewState.quiet) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.actions = filterAction(previewState.actions, name)
}

const filterAction = function (actions, name) {
  return actions.filter((action) => action.name !== name)
}
