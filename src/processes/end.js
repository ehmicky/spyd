import pEvent from 'p-event'

export const endChild = async function(child) {
  child.disconnect()

  const [exitCode, signal] = await pEvent(child, 'exit', {
    multiArgs: true,
  })

  if (exitCode !== 0) {
    throw new Error(`Child process exited with code ${exitCode}`)
  }

  if (signal !== null) {
    throw new Error(`Child process exited with signal '${signal}'`)
  }
}
