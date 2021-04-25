import omit from 'omit.js'

import { goodColor, separatorColor } from '../report/utils/colors.js'

// Show keys available for user actions in previews
export const getActions = function (actions, leftWidth) {
  const actionValues = Object.values(actions)

  if (actionValues.length === 0) {
    return
  }

  const actionsStr = actionValues.map(getAction).join(separatorColor(', '))
  return `${ACTIONS_LABEL.padEnd(leftWidth)}${actionsStr}`
}

const getAction = function ({ key, explanation }) {
  return `${goodColor(key)} ${separatorColor(`(${explanation})`)}`
}

export const ACTIONS_LABEL = 'Actions'

export const addAction = function (previewState, name) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.actions = { ...previewState.actions, [name]: ACTIONS[name] }
}

export const removeAction = function (previewState, name) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.actions = omit(previewState.actions, [name])
}

export const DEFAULT_ACTIONS = {
  stop: { key: 'Ctrl-C', explanation: 'Stop' },
}

const ACTIONS = {
  ...DEFAULT_ACTIONS,
  abort: { key: 'Ctrl-C', explanation: 'Abort' },
  scrollUp: { key: 'Up', explanation: 'Scroll' },
  scrollDown: { key: 'Down', explanation: 'Scroll' },
  scrollUpDown: { key: 'Up/Down', explanation: 'Scroll' },
}
