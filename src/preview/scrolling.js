// When content is taller than the terminal height, allow user to scroll with
// up/down. We do this by keeping tracking of `scrollTop` and truncating the
// content to print on the terminal.
// Scrolling is applied to the `report`, but not to the bottom bar.
//  - However, the bottom bar height is taken into account since it takes some
//    space.
//  - If the screen height is not high enough to show the bottom bar, the report
//    will be hidden and the bottom of the bottom bar will be partiall hidden.
export const applyScrolling = function ({
  report,
  bottomBar,
  scrollTop,
  screenHeight,
}) {
  const availableHeight = screenHeight - getNewlineIndexes(bottomBar).length

  if (availableHeight <= 0) {
    return ''
  }

  const newlineIndexes = getNewlineIndexes(report)
  const contentHeight = newlineIndexes.length

  if (contentHeight <= availableHeight) {
    return report
  }

  const topIndex = Math.min(scrollTop, contentHeight - availableHeight)
  const bottomIndex = topIndex + availableHeight - 1
  return report.slice(
    topIndex === 0 ? 0 : newlineIndexes[topIndex - 1] + 1,
    newlineIndexes[bottomIndex] + 1,
  )
}

// Uses imperative code for performance
const getNewlineIndexes = function (previewContent) {
  const newlineIndexes = []

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let, unicorn/no-for-loop
  for (let index = 0; index < previewContent.length; index += 1) {
    // eslint-disable-next-line max-depth
    if (previewContent[index] === '\n') {
      // eslint-disable-next-line fp/no-mutating-methods
      newlineIndexes.push(index)
    }
  }

  return newlineIndexes
}
