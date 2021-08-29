import process from 'process'
import { emitKeypressEvents } from 'readline'

import { isTtyInput } from '../../../report/tty.js'
import { refreshPreview } from '../update/main.js'

// Handle user actions through key events.
// We purposely use `bind()` so that this function can be called several times
// concurrently.
// The keypress logic would fail when stdin is not interactive.
export const startHandleKeypress = function (previewState) {
  if (!isTtyInput()) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.stdinIsRaw = process.stdin.isRaw
  process.stdin.setRawMode(true)
  emitKeypressEvents(process.stdin)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.handleKeypress = handleKeypress.bind(undefined, previewState)
  process.stdin.on('keypress', previewState.handleKeypress)
  process.stdin.resume()
}

export const stopHandleKeypress = function (previewState) {
  if (!isTtyInput()) {
    return
  }

  process.stdin.pause()
  process.stdin.off('keypress', previewState.handleKeypress)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete previewState.handleKeypress
  process.stdin.setRawMode(previewState.stdinIsRaw)
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete previewState.stdinIsRaw
}

const handleKeypress = function (previewState, keyString, key) {
  const keyHandlerA = KEY_HANDLERS.find((keyHandler) =>
    matchesKey(keyHandler, key),
  )

  if (keyHandlerA === undefined) {
    return
  }

  keyHandlerA.handler(previewState)
}

const matchesKey = function ({ keys }, { name, ctrl, meta }) {
  return keys.some(
    (key) =>
      key.name === name &&
      Boolean(key.ctrl) === ctrl &&
      Boolean(key.meta) === meta,
  )
}

const scrollUp = function (previewState) {
  scroll(-1, previewState)
}

const scrollDown = function (previewState) {
  scroll(1, previewState)
}

const scrollUpPage = function (previewState) {
  scroll(-getPageAmount(previewState), previewState)
}

const scrollDownPage = function (previewState) {
  scroll(getPageAmount(previewState), previewState)
}

const getPageAmount = function (previewState) {
  return Math.max(previewState.availableHeight - 2, 1)
}

const scroll = function (scrollAmount, previewState) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  previewState.scrollTop += scrollAmount
  refreshPreview(previewState)
}

const sigint = function () {
  process.emit('SIGINT')
}

const sigbreak = function () {
  process.emit('SIGBREAK')
}

const KEY_HANDLERS = [
  {
    handler: scrollUp,
    keys: [{ name: 'up' }, { name: 'k' }, { name: 'p', ctrl: true }],
  },
  {
    handler: scrollDown,
    keys: [{ name: 'down' }, { name: 'j' }, { name: 'n', ctrl: true }],
  },
  {
    handler: scrollUpPage,
    keys: [{ name: 'pageup' }, { name: 'b', ctrl: true }],
  },
  {
    handler: scrollDownPage,
    keys: [{ name: 'pagedown' }, { name: 'f', ctrl: true }],
  },
  // Handles some shortcuts which usually send a terminal signal to the process
  // so that those are handled by the stop logic
  { handler: sigint, keys: [{ name: 'c', ctrl: true }] },
  { handler: sigbreak, keys: [{ name: 'pagedown', meta: true }] },
]
