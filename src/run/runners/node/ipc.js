import { argv } from 'process'
import { write } from 'fs'
import { promisify } from 'util'

const pWrite = promisify(write)

// Get input from parent to child process
export const getInput = function() {
  const [, , input] = argv
  return JSON.parse(input)
}

// Send output from child to parent process
export const sendOutput = async function(message) {
  if (message === undefined) {
    return
  }

  const messageStr = JSON.stringify(message)
  await pWrite(OUTPUT_FD, messageStr)
}

// Send error messages from child to parent process
export const sendError = async function(error, type) {
  const fd = type === 'debug' ? DEBUG_ERROR_FD : ERROR_FD
  const message = error instanceof Error ? error.stack : String(error)
  await pWrite(fd, `${message}\n`)
}

// Communicate to parent using those file descriptors
const DEBUG_ERROR_FD = 2
const OUTPUT_FD = 4
const ERROR_FD = 5
