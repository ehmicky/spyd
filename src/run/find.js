import { extname } from 'path'

// Find the runners according to the task file extension
export const findRunners = function(taskPath, runners) {
  const extension = extname(taskPath)
  const runnersA = runners.filter(({ extensions }) =>
    matchExtension(extensions, extension),
  )

  if (runnersA.length === 0) {
    throw new Error(`Please specify a 'runner' for '${taskPath}'`)
  }

  return runnersA
}

const matchExtension = function(extensions, extension) {
  return extensions.some(extensionA => `.${extensionA}` === extension)
}
