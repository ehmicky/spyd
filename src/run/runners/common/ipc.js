import { writeFile } from 'fs'
import { argv, exit } from 'process'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

// Run a method among many possible ones, selecting it according to
// eventPayload.type.
// Retrieve the parent process's event payload and passes it as argument to
// the method.
// The method's return value is sent to the parent process.
// Errors are handled and sent to the parent process too.
export const runMethod = async function (methodTypes) {
  const { type, resultFile, ...eventPayload } = getEventPayload()

  try {
    const result = await methodTypes[type](eventPayload)
    await sendResult(resultFile, result)
  } catch (error) {
    await sendError(resultFile, error)
    exit(1)
  }
}

// Get event payload from parent to child process
const getEventPayload = function () {
  const [, , eventPayloadStr] = argv
  return JSON.parse(eventPayloadStr)
}

// Send error messages from child to parent process
const sendError = async function (resultFile, error) {
  const errorProp = error instanceof Error ? error.stack : String(error)
  await sendResult(resultFile, { error: errorProp })
}

// Send output from child to parent process
const sendResult = async function (resultFile, message) {
  const messageStr = `${JSON.stringify(message)}\n`
  await pWriteFile(resultFile, messageStr)
}
