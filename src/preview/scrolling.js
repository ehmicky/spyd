// When content is taller than the terminal height, allow user to scroll with
// up/down. We do this by keeping tracking of `scrollTop` and truncating the
// content to print on the terminal.
// Scrolling is applied to the `report`, but not to the bottom bar.
//  - However, the bottom bar height is taken into account since it takes some
//    space.
//  - If the screen height is not high enough to show the bottom bar, the report
//    will be hidden and the bottom of the bottom bar will be partiall hidden.
// `scrollTop` is adjusted when going beyond the upper|lower boundaries:
//  - This ensures users does not need to scroll several times when the report
//    size shrinks
//  - This prevents jittering when the scrolling completely down and the report
//    size shrinks
// We do not take into account that one line might take several terminal rows
// due to wrapping because this makes scrolling faster when lines are long.
// eslint-disable-next-line max-statements
export const applyScrolling = function ({
  report,
  bottomBar,
  scrollTop,
  screenHeight,
}) {
  const availableHeight = screenHeight - getNewlineIndexes(bottomBar).length

  if (availableHeight <= 0) {
    return { report: '', scrollTop: 0 }
  }

  const newlineIndexes = getNewlineIndexes(report)
  const contentHeight = newlineIndexes.length

  if (contentHeight <= availableHeight) {
    return { report, scrollTop: 0 }
  }

  const scrollTopA = Math.max(
    Math.min(scrollTop, contentHeight - availableHeight),
    0,
  )
  const bottomIndex = scrollTopA + availableHeight - 1
  const reportA = report.slice(
    scrollTopA === 0 ? 0 : newlineIndexes[scrollTopA - 1] + 1,
    newlineIndexes[bottomIndex] + 1,
  )
  return { report: reportA, scrollTop: scrollTopA }
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
