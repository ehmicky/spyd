import process from 'node:process'

// Ensure default handlers for those signals are not used.
// Create a new `noop` function at each call, in case this function is called
// several times in parallel.
export const removeDefaultHandlers = () => {
  const signalHandler = noop.bind()
  STOP_SIGNALS.forEach((signal) => {
    process.on(signal, signalHandler)
  })
  return signalHandler
}

// eslint-disable-next-line no-empty-function
const noop = () => {}

export const restoreDefaultHandlers = (signalHandler) => {
  STOP_SIGNALS.forEach((signal) => {
    process.off(signal, signalHandler)
  })
}

// Signals usually done interactively by user in terminals, cross-platform.
// We allow non-interactive signals sending too for programmatic usage.
export const STOP_SIGNALS = [
  'SIGINT',
  'SIGBREAK',
  'SIGHUP',
  'SIGTERM',
  'SIGQUIT',
]
