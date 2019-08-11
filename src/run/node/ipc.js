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

// Communicate to parent using that file descriptor
const OUTPUT_FD = 4
