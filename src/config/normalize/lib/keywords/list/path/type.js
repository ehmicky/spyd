import { statSync } from 'node:fs'
import { stat } from 'node:fs/promises'

import { FILE_KEYWORD, DIR_KEYWORD } from './normalize.js'

// Check the "file|directory" keywords
export const validateType = function (input, keywords) {
  const types = listTypes(keywords)

  if (types.length !== 0 && !hasValidType(input, types)) {
    throwTypeError(types)
  }
}

export const validateTypeAsync = async function (input, keywords) {
  const types = listTypes(keywords)

  if (types.length !== 0 && !(await hasValidTypeAsync(input, types))) {
    throwTypeError(types)
  }
}

const listTypes = function (keywords) {
  return TYPE_METHODS.filter(({ keyword }) => keywords.has(keyword))
}

const TYPE_METHODS = [
  { keyword: FILE_KEYWORD, method: 'isFile', name: 'a regular file' },
  { keyword: DIR_KEYWORD, method: 'isDirectory', name: 'a directory' },
]

const hasValidType = function (input, types) {
  const fileStat = getFileStat(input)
  return hasValidFileStat(fileStat, types)
}

const hasValidTypeAsync = async function (input, types) {
  const fileStat = await getFileStatAsync(input)
  return hasValidFileStat(fileStat, types)
}

const getFileStat = function (input) {
  try {
    return statSync(input)
  } catch {}
}

const getFileStatAsync = async function (input) {
  try {
    return await stat(input)
  } catch {}
}

const hasValidFileStat = function (fileStat, types) {
  return (
    fileStat !== undefined && types.some(({ method }) => fileStat[method]())
  )
}

const throwTypeError = function (types) {
  const message = types.map(({ name }) => name).join(' or ')
  throw new Error(`must be ${message}.`)
}
