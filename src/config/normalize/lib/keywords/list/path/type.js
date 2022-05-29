import { stat } from 'fs/promises'

import { FILE_KEYWORD, DIR_KEYWORD } from './normalize.js'

// Check the "file|directory" keywords
export const validateType = async function (input, keywords) {
  const types = TYPE_METHODS.filter(({ keyword }) => keywords.has(keyword))

  if (types.length !== 0 && !(await hasValidType(input, types))) {
    const message = types.map(({ name }) => name).join(' or ')
    throw new Error(`must be ${message}.`)
  }
}

const hasValidType = async function (input, types) {
  const fileStat = await getFileStat(input)
  return (
    fileStat !== undefined && types.some(({ method }) => fileStat[method]())
  )
}

const getFileStat = async function (input) {
  try {
    return await stat(input)
  } catch {}
}

const TYPE_METHODS = [
  { keyword: FILE_KEYWORD, method: 'isFile', name: 'a regular file' },
  { keyword: DIR_KEYWORD, method: 'isDirectory', name: 'a directory' },
]
