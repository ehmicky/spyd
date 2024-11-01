import { getScreenHeight } from '../../../report/tty.js'

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
export const updateScrolling = (previewState, bottomBar) => {
  const availableHeight = getAvailableHeight(bottomBar)
  const { report, scrollTop, maxScrollTop } = applyScrolling(
    previewState,
    availableHeight,
  )
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, { scrollTop, availableHeight })
  return { report, maxScrollTop }
}

// Terminals print the row after the last newline, i.e. we need to subtract 1
const getAvailableHeight = (bottomBar) => {
  const screenHeight = getScreenHeight()
  const bottomBarHeight = getNewlineIndexes(bottomBar).length
  return Math.max(screenHeight - bottomBarHeight - 1, 0)
}

const applyScrolling = ({ report, scrollTop }, availableHeight) => {
  if (availableHeight === 0) {
    return { report: '', scrollTop: 0, maxScrollTop: 0 }
  }

  const newlineIndexes = getNewlineIndexes(report)
  const maxScrollTop = Math.max(newlineIndexes.length - availableHeight, 0)

  if (maxScrollTop === 0) {
    return { report, scrollTop: 0, maxScrollTop }
  }

  const scrollTopA = Math.max(Math.min(scrollTop, maxScrollTop), 0)
  const reportA = sliceReport({
    report,
    scrollTop: scrollTopA,
    availableHeight,
    newlineIndexes,
  })
  return { report: reportA, scrollTop: scrollTopA, maxScrollTop }
}

// Uses imperative code for performance
const getNewlineIndexes = (previewContent) => {
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

// Remove rows from report to apply scrolling effect
const sliceReport = ({
  report,
  scrollTop,
  availableHeight,
  newlineIndexes,
}) => {
  const topIndex = scrollTop === 0 ? 0 : newlineIndexes[scrollTop - 1] + 1
  const bottomRowIndex = scrollTop + availableHeight - 1
  const bottomIndex = newlineIndexes[bottomRowIndex] + 1
  return report.slice(topIndex, bottomIndex)
}
