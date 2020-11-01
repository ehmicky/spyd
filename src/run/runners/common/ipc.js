import { write } from 'fs'
import { argv } from 'process'
import { promisify } from 'util'

const pWrite = promisify(write)

// Get input from parent to child process
export const getInput = function () {
  const [, , input] = argv
  return JSON.parse(input)
}

// Send output from child to parent process
export const sendOutput = async function (message) {
  if (message === undefined) {
    return
  }

  const messageStr = JSON.stringify(message)
  await writeOutput(messageStr)
}

// Send error messages from child to parent process
export const sendError = async function (error) {
  const message = error instanceof Error ? error.stack : String(error)
  await writeOutput(message)
}

const writeOutput = async function (message) {
  await pWrite(OUTPUT_FD, `${message}\n`)
}

// Communicate to parent using those file descriptors
const OUTPUT_FD = 3
