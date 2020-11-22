import { writeFile } from 'fs'
import { argv, exit } from 'process'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

// Execute a method among many possible ones, selecting it according to
// eventPayload.type.
// Retrieve the parent process's event payload and passes it as argument to
// the method.
// The method's return value is sent to the parent process.
// Errors are handled and sent to the parent process too.
export const executeMethod = async function (methodTypes) {
  const { type, ipcFile, ...eventPayload } = getEventPayload()

  try {
    const ipcReturn = await methodTypes[type](eventPayload)
    await sendIpcReturn(ipcFile, ipcReturn)
  } catch (error) {
    await sendError(ipcFile, error)
    exit(1)
  }
}

// Get event payload from parent to child process
const getEventPayload = function () {
  const [, , eventPayloadStr] = argv
  return JSON.parse(eventPayloadStr)
}

// Send error messages from child to parent process
const sendError = async function (ipcFile, error) {
  const errorProp = error instanceof Error ? error.stack : String(error)
  await sendIpcReturn(ipcFile, { error: errorProp })
}

// Send return value from child to parent process
const sendIpcReturn = async function (ipcFile, ipcReturn) {
  const ipcReturnStr = `${JSON.stringify(ipcReturn)}\n`
  await pWriteFile(ipcFile, ipcReturnStr)
}
