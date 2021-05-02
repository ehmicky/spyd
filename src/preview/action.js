// Add|remove available user actions shown in preview
export const addAction = function (previewState, name) {
  if (previewState.quiet) {
    return
  }

  const actionsA = filterAction(previewState.actions, name)
  const actionA = ACTIONS.find((action) => action.name === name)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.actions = [...actionsA, actionA]
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

// All Available user actions. Enabled/disabled depending on the context.
const ACTIONS = [
  { name: 'stop', key: 'Ctrl-C', explanation: 'Stop' },
  { name: 'abort', key: 'Ctrl-C', explanation: 'Abort' },
  { name: 'scrollUp', key: 'Up', explanation: 'Scroll' },
  { name: 'scrollDown', key: 'Down', explanation: 'Scroll' },
  { name: 'scrollUpDown', key: 'Up/Down', explanation: 'Scroll' },
]
