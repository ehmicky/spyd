import { argv } from 'process'
import { writeFile } from 'fs'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

// Get input from parent to child process
export const getInput = function() {
  const [, , input] = argv
  return JSON.parse(input)
}

// Send output from child to parent process
export const sendOutput = async function(message) {
  const messageStr = JSON.stringify(message)
  await pWriteFile(OUTPUT_FD, messageStr)
}

// Send error messages from child to parent process
export const sendError = async function(error) {
  const message = error instanceof Error ? error.stack : String(error)
  await pWriteFile(ERROR_FD, `${message}\n`)
}

// Communicate to parent using those file descriptors
const OUTPUT_FD = 4
const ERROR_FD = 5
