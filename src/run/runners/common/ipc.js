import { writeFile } from 'fs'
import { argv } from 'process'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

// Get input from parent to child process
export const getInput = function () {
  const [, , inputStr] = argv
  return JSON.parse(inputStr)
}

// Send output from child to parent process
export const sendOutput = async function (resultFile, message = {}) {
  await writeOutput(resultFile, message)
}

// Send error messages from child to parent process
export const sendError = async function (resultFile, error) {
  const errorProp = error instanceof Error ? error.stack : String(error)
  const message = { error: errorProp }
  await writeOutput(resultFile, message)
}

const writeOutput = async function (resultFile, message) {
  const messageStr = JSON.stringify(message)
  await pWriteFile(resultFile, `${messageStr}\n`)
}
