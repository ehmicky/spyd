import { writeFile } from 'fs'
import { argv, exit } from 'process'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

// Run a method among many possible ones, selecting it according to input.type.
// Retrieve the parent process's input and passes it as argument to the method.
// The method's return value is sent to the parent process.
// Errors are handled and sent to the parent process too.
export const runMethod = async function (methodTypes) {
  const { type, resultFile, ...input } = getInput()

  try {
    const result = await methodTypes[type](input)
    await sendResult(resultFile, result)
  } catch (error) {
    await sendError(resultFile, error)
    exit(1)
  }
}

// Get input from parent to child process
const getInput = function () {
  const [, , inputStr] = argv
  return JSON.parse(inputStr)
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
