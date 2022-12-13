import { addAction, removeAction } from '../action.js'

// The scrolling logic relies on knowing the height of the bottom bar.
// The height of the bottom bar might depend on whether a scrolling action is
// shown, which itself depends on the above. This creates a cycle.
// We fix this by making the scrolling logic assume the bottom bar has a
// scrolling action, with the longest explanation. Once the bottom bar height
// has been used by the scrolling logic, we update to the real scrolling action.
export const addInitialScrollAction = (previewState) => {
  addAction(previewState, SCROLL_ACTION)
}

// Add/remove action in to the bottom bar indicating whether the user can scroll
export const addScrollAction = ({
  previewState,
  previewState: { scrollTop },
  maxScrollTop,
}) => {
  const canScrollUp = scrollTop !== 0
  const canScrollDown = scrollTop !== maxScrollTop

  if (!canScrollUp && !canScrollDown) {
    removeAction(previewState, SCROLL_ACTION.name)
    return
  }

  const action = getScrollAction(canScrollUp, canScrollDown)
  addAction(previewState, action)
}

const getScrollAction = (canScrollUp, canScrollDown) => {
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
