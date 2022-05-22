import { stat } from 'fs/promises'

import { FILE_KEYWORD, DIR_KEYWORD } from './check.js'

// Check the "file|directory" keywords
export const validateType = async function (value, keywords) {
  const types = TYPE_METHODS.filter(({ keyword }) => keywords.has(keyword))

  if (types.length !== 0 && !(await hasValidType(value, types))) {
    const message = types.map(({ name }) => name).join(' or ')
    throw new Error(`must be ${message}.`)
  }
}

const hasValidType = async function (value, types) {
  const fileStat = await getFileStat(value)
  return (
    fileStat !== undefined && types.some(({ method }) => fileStat[method]())
  )
}

const getFileStat = async function (value) {
  try {
    return await stat(value)
  } catch {}
}

const TYPE_METHODS = [
  { keyword: FILE_KEYWORD, method: 'isFile', name: 'a regular file' },
  { keyword: DIR_KEYWORD, method: 'isDirectory', name: 'a directory' },
]
