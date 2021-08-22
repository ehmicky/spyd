import { getCombinationNameWidth } from '../../../utils/name.js'
import { getResponsiveColumns } from '../../../utils/responsive.js'
import { SEPARATOR_WIDTH } from '../../../utils/separator.js'

export const getAllColumns = function ({
  combinations,
  columns,
  screenWidth,
  columnWidth,
}) {
  const availableWidth = screenWidth - getCombinationNameWidth(combinations[0])
  return getResponsiveColumns({
    availableWidth,
    columnWidth,
    separatorWidth: SEPARATOR_WIDTH,
    columns,
  })
}
