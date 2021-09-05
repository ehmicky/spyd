import { handleContent } from '../../../report/handle.js'
import { getLineSeparator } from '../../../report/utils/line.js'

import { getActions, ACTIONS_LABEL } from './actions.js'
import { getCounterRow, getCounter } from './counter.js'
import { getProgressRow } from './progress.js'

// Retrieve bottom bar of preview
export const getBottomBar = function ({
  actions,
  durationLeft,
  percentage,
  report,
  index,
  total,
  combinationName,
  description,
  reporters: [
    {
      config: { colors },
    },
  ],
}) {
  const separator = getSeparator(report)
  const leftWidth = getLeftWidth({ durationLeft, total })
  const progressRow = getProgressRow({ durationLeft, percentage, leftWidth })
  const counterRow = getCounterRow({
    index,
    total,
    combinationName,
    description,
    leftWidth,
  })
  const actionsA = getActions(actions, leftWidth)
  const content = `${separator}${progressRow}\n${counterRow}\n${actionsA}`
  const bottomBar = handleContent({ content, colors, padding: true })
  return bottomBar
}

const getSeparator = function (report) {
  return report === '' ? '' : `${getLineSeparator()}\n`
}

const getLeftWidth = function ({ durationLeft, total }) {
  return (
    Math.max(
      durationLeft.length,
      getCounter(total, total).length,
      ACTIONS_LABEL.length,
    ) + LEFT_WIDTH_PADDING
  )
}

const LEFT_WIDTH_PADDING = 2
