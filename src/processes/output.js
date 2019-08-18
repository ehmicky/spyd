import getStream from 'get-stream'

// Retrieve success output
export const getOutput = function(child, outputFd) {
  if (outputFd === undefined) {
    return
  }

  return getChildFd(child, outputFd)
}

// Retrieve error output. Can be distributed over several file descriptors.
export const getErrorOutput = async function(child, errorFds) {
  const errorOutputs = await Promise.all(
    errorFds.map(fd => getChildFd(child, fd)),
  )
  return errorOutputs.filter(Boolean).join('\n\n')
}

const getChildFd = async function(child, fd) {
  const output = await getStream(child.stdio[fd], { maxBuffer: MAX_BUFFER })
  return output.trim()
}

// Child process output and error output cannot exceed 100 MB
const MAX_BUFFER = 1e8
