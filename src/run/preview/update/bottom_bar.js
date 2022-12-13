import { handleContent } from '../../../report/contents/handle.js'
import { getFullLineSeparator } from '../../../report/utils/line.js'

import { getActions, ACTIONS_LABEL } from './actions.js'
import { getCounterRow, getCounter } from './counter.js'
import { getProgressRow } from './progress.js'

// Retrieve bottom bar of preview
export const getBottomBar = ({
  actions,
  durationLeft,
  percentage,
  report,
  index,
  total,
  combinationNameColor,
  description,
  reporters: [
    {
      config: { colors },
    },
  ],
}) => {
  const separator = getSeparator(report)
  const leftWidth = getLeftWidth({ durationLeft, total })
  const progressRow = getProgressRow({ durationLeft, percentage, leftWidth })
  const counterRow = getCounterRow({
    index,
    total,
    combinationNameColor,
    description,
    leftWidth,
  })
  const actionsA = getActions(actions, leftWidth)
  const content = `${progressRow}\n${counterRow}\n${actionsA}`
  const bottomBar = handleContent({ content, colors, padding: true })
  return `${separator}${bottomBar}`
}

// The separator is only present when there is some `report` to separate from.
// It has bottom padding to separate it from the `bottomBar` but no top padding
// to separate it from the `report`, to make it clear the `bottomBar` overlays
// it.
const getSeparator = (report) => (report === '' ? '' : getFullLineSeparator())

const getLeftWidth = ({ durationLeft, total }) =>
  Math.max(
    durationLeft.length,
    getCounter(total, total).length,
    ACTIONS_LABEL.length,
  ) + LEFT_WIDTH_PADDING

const LEFT_WIDTH_PADDING = 2
