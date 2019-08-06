import pEvent from 'p-event'

// Wait for child process exit when it's not suppose to.
// Forward any exit as an early exit error.
export const failOnExit = async function(child) {
  const { exitCode, signal } = await getExit(child)

  await reportStderr(child)

  forwardChildError(signal, exitCode)
}

export const getExit = async function(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return { exitCode: child.exitCode, signal: child.signalCode }
  }

  const [exitCode, signal] = await pEvent(child, 'exit', { multiArgs: true })
  return { exitCode, signal }
}

// If there's an issue with the child process, reports its stderr
export const reportStderr = async function(child) {
  const stderr = await child.stderrPromise
  const stderrA = stderr.trim()

  if (stderrA !== '') {
    throw new Error(stderrA)
  }
}

export const forwardChildError = function(signal, exitCode) {
  const signalStr = signal === null ? '' : ` with ${signal}`
  const exitCodeStr =
    exitCode === 0 || exitCode === null ? '' : ` (exit code ${exitCode})`
  throw new Error(`Child process exited ${signalStr}${exitCodeStr}`)
}
