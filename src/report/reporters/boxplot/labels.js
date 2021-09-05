// Retrieve the median label line shown below the box plot
export const getLabels = function ({
  positions: { median },
  titlesWidth,
  minBlockWidth,
  contentWidth,
}) {
  const leftShift = Math.max(Math.floor((median.pretty.length - 1) / 2), 0)
  const shiftedIndex = median.index - leftShift
  const maxContentIndex = contentWidth - median.pretty.length
  const contentIndex = Math.min(Math.max(shiftedIndex, 0), maxContentIndex)
  const labelIndex = contentIndex + titlesWidth + minBlockWidth
  const labelLeft = ' '.repeat(labelIndex)
  return `${labelLeft}${median.prettyColor}\n`
}
