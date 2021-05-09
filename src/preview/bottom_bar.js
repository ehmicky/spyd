import { goodColor, noteColor } from '../report/utils/colors.js'
import { addPadding } from '../report/utils/indent.js'

import { wrapPaddedRows } from './wrap.js'

// Retrieve bottom bar of preview
export const getBottomBar = function ({
  previewState: { actions },
  separator,
  leftWidth,
  progressRow,
  counterRow,
}) {
  const actionsA = getActions(actions, leftWidth)
  const rows = addPadding(`${progressRow}\n\n${counterRow}\n\n${actionsA}`)
  return `${separator}${rows}`
}

// Show keys available for user actions in previews.
// When there are no actions available, we keep an empty line to avoid jitter.
const getActions = function (actions, leftWidth) {
  const actionValues = Object.values(actions)

  if (actionValues.length === 0) {
    return ''
  }

  const actionsStr = actionValues.map(getAction).join(noteColor(', '))
  return wrapPaddedRows(`${ACTIONS_LABEL.padEnd(leftWidth)}${actionsStr}`)
}

const getAction = function ({ key, explanation }) {
  return `${goodColor(key)} ${noteColor(`(${explanation})`)}`
}

export const ACTIONS_LABEL = 'Actions'
