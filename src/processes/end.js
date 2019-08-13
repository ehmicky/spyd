import pEvent from 'p-event'

// Sending SIGTERM to child instead of sending a termination message requires
// less implementation work for children.
export const endChild = function(child) {
  child.kill()
}

// Wait for child process exit when it's not supposed to.
// Forward any exit as an early exit error.
export const throwOnExit = async function(child) {
  const { exitCode, signal } = await getExit(child)

  forwardChildError(signal, exitCode)
}

const getExit = async function(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return { exitCode: child.exitCode, signal: child.signalCode }
  }

  const [exitCode, signal] = await pEvent(child, 'exit', { multiArgs: true })
  return { exitCode, signal }
}

const forwardChildError = function(signal, exitCode) {
  const signalStr = signal === null ? '' : ` with ${signal}`
  const exitCodeStr =
    exitCode === 0 || exitCode === null ? '' : ` (exit code ${exitCode})`
  throw new Error(`Child process exited ${signalStr}${exitCodeStr}`)
}

// If there's an issue with the child process, reports its stderr
export const reportStderr = async function(child) {
  const stderr = await child.stderrPromise
  const stderrA = stderr.trim()

  if (stderrA !== '') {
    throw new Error(stderrA)
  }
}
