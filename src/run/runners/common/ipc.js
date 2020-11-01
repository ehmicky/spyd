import { writeFile } from 'fs'
import { argv } from 'process'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

// Get input from parent to child process
export const getInput = function () {
  const [, , inputStr] = argv
  return JSON.parse(inputStr)
}

// Send error messages from child to parent process
export const sendError = async function (resultFile, error) {
  const errorProp = error instanceof Error ? error.stack : String(error)
  await sendResult(resultFile, { error: errorProp })
}

// Send output from child to parent process
export const sendResult = async function (resultFile, message) {
  const messageStr = `${JSON.stringify(message)}\n`
  await pWriteFile(resultFile, messageStr)
}
