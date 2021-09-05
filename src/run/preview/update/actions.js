import { goodColor, noteColor } from '../../../report/utils/colors.js'

// Show keys available for user actions in previews.
// When there are no actions available, we keep an empty line to avoid jitter.
export const getActions = function (actions, leftWidth) {
  if (actions.length === 0) {
    return ''
  }

  const actionsStr = actions.map(getAction).join(noteColor(ACTION_SEPARATOR))
  return `${ACTIONS_LABEL.padEnd(leftWidth)}${actionsStr}`
}

const getAction = function ({ key, explanation }) {
  return `${goodColor(key)} ${noteColor(`(${explanation})`)}`
}

const ACTION_SEPARATOR = ', '
export const ACTIONS_LABEL = 'Actions'
