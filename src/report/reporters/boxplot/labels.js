import { centerString } from '../../utils/center.js'

// Retrieve the median label line shown below the box plot
export const getLabels = ({
  positions: { median },
  titlesWidth,
  minBlockWidth,
  contentWidth,
}) => {
  const centeredMedian = centerString(
    median.prettyColor,
    median.index,
    contentWidth,
  )
  const initialSpace = ' '.repeat(titlesWidth + minBlockWidth)
  return `${initialSpace}${centeredMedian}\n`
}
