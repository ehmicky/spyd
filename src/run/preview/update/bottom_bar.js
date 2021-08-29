import stripFinalNewline from 'strip-final-newline'

import { handleContentString } from '../../../report/handle.js'
import { goodColor, noteColor } from '../../../report/utils/colors.js'
import { wrapPaddedRows } from '../../../report/utils/wrap.js'

// Retrieve bottom bar of preview
export const getBottomBar = function ({
  previewState: {
    actions,
    reporters: [
      {
        config: { colors },
      },
    ],
  },
  leftWidth,
  progressRow,
  counterRow,
}) {
  const actionsA = getActions(actions, leftWidth)
  const content = `${progressRow}\n\n${counterRow}\n\n${actionsA}`
  const bottomBar = handleContentString({ content, padding: true, colors })
  const bottomBarA = stripFinalNewline(bottomBar)
  return bottomBarA
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
