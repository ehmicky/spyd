import { extname } from 'path'

import { node } from './node/main.js'

export const getRunners = function(taskPath) {
  const extension = extname(taskPath)
  const runners = RUNNERS.filter(({ extensions }) =>
    matchExtension(extensions, extension),
  )

  if (runners.length === 0) {
    throw new Error(`Please specify a 'runner' for '${taskPath}'`)
  }

  return runners
}

const matchExtension = function(extensions, extension) {
  return extensions.some(extensionA => `.${extensionA}` === extension)
}

const RUNNERS = [node]
