import { addAction, removeAction } from './action.js'
import { BOTTOM_BAR_HEIGHT } from './bottom.js'

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
export const updateScrolling = function (previewState, screenHeight) {
  const availableHeight = getAvailableHeight(screenHeight)
  const { report, scrollTop, maxScrollTop } = applyScrolling(
    previewState,
    availableHeight,
  )
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, { scrollTop, availableHeight })
  addScrollAction(previewState, scrollTop, maxScrollTop)
  return report
}

// We need to subtract one due to the fast that the bottom bar is the last
// element, i.e. its final newline not only terminates a line but also starts
// a last empty row.
const getAvailableHeight = function (screenHeight) {
  return screenHeight - BOTTOM_BAR_HEIGHT - 1
}

const applyScrolling = function ({ report = '', scrollTop }, availableHeight) {
  if (availableHeight <= 0) {
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

// Remove rows from report to apply scrolling effect
const sliceReport = function ({
  report,
  scrollTop,
  availableHeight,
  newlineIndexes,
}) {
  const topIndex = scrollTop === 0 ? 0 : newlineIndexes[scrollTop - 1] + 1
  const bottomRowIndex = scrollTop + availableHeight - 1
  const bottomIndex = newlineIndexes[bottomRowIndex] + 1
  return report.slice(topIndex, bottomIndex)
}

// Add/remove action in to the bottom bar indicating whether the user can scroll
const addScrollAction = function (previewState, scrollTop, maxScrollTop) {
  const canScrollUp = scrollTop !== 0
  const canScrollDown = scrollTop !== maxScrollTop

  if (!canScrollUp && !canScrollDown) {
    removeAction(previewState, SCROLL_ACTION.name)
    return
  }

  const action = getScrollAction(canScrollUp, canScrollDown)
  addAction(previewState, action)
}

const getScrollAction = function (canScrollUp, canScrollDown) {
  if (!canScrollUp) {
    return SCROLL_DOWN_ACTION
  }

  return canScrollDown ? SCROLL_ACTION : SCROLL_UP_ACTION
}

const SCROLL_ACTION = {
  name: 'scroll',
  key: 'Up/Down',
  explanation: 'Scroll',
  order: 1,
}
const SCROLL_UP_ACTION = { ...SCROLL_ACTION, key: 'Up' }
const SCROLL_DOWN_ACTION = { ...SCROLL_ACTION, key: 'Down' }
