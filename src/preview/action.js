import omit from 'omit.js'

// Add|remove available user actions shown in preview
export const addAction = function (previewState, name) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.actions = { ...previewState.actions, [name]: ACTIONS[name] }
}

export const removeAction = function (previewState, name) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.actions = omit(previewState.actions, [name])
}

// User actions at the beginning
export const DEFAULT_ACTIONS = {}

// All Available user actions. Enabled/disabled depending on the context.
const ACTIONS = {
  ...DEFAULT_ACTIONS,
  stop: { key: 'Ctrl-C', explanation: 'Stop' },
  abort: { key: 'Ctrl-C', explanation: 'Abort' },
  scrollUp: { key: 'Up', explanation: 'Scroll' },
  scrollDown: { key: 'Down', explanation: 'Scroll' },
  scrollUpDown: { key: 'Up/Down', explanation: 'Scroll' },
}
