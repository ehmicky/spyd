import getStream from 'get-stream'

// Retrieve success output
// We cannot use `execa` `buffer: true` because we are targetting other file
// descriptors than stdin/stdout/stderr
export const getOutput = function (child) {
  return getChildFd(child, OUTPUT_FD)
}

// Retrieve error output. Can be distributed over several file descriptors.
export const getErrorOutput = async function (child) {
  const errorOutputs = await Promise.all(
    [OUTPUT_FD, STDERR_FD, STDOUT_FD].map((fd) => getChildFd(child, fd)),
  )
  return errorOutputs.filter(Boolean).join('\n\n')
}

const getChildFd = async function (child, fd) {
  const stream = child.stdio[fd]

  if (stream === null) {
    return
  }

  const output = await getStream(stream, { maxBuffer: MAX_BUFFER })
  return output.trim()
}

const STDOUT_FD = 1
const STDERR_FD = 2
const OUTPUT_FD = 3

// Child process output and error output cannot exceed 100 MB
const MAX_BUFFER = 1e8
