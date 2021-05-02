import { addAction, removeAction } from './action.js'

// Add/remove action in to the bottom bar indicating whether the user can scroll
export const addScrollAction = function ({
  previewState,
  previewState: { scrollTop },
  maxScrollTop,
}) {
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
