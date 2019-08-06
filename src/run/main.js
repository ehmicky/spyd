import { extname } from 'path'

import { node } from './node/main.js'

export const getRunners = function(taskPath) {
  const extension = extname(taskPath)
  const runner = RUNNERS.find(({ extensions }) =>
    findExtension({ extensions, extension }),
  )

  if (runner === undefined) {
    throw new Error(`Please specify a 'runner' for '${taskPath}'`)
  }

  return [runner]
}

const findExtension = function({ extensions, extension }) {
  return extensions.some(extensionA => `.${extensionA}` === extension)
}

const RUNNERS = [node]
