import { constants, accessSync } from 'fs'
import { access } from 'fs/promises'

import { READ_KEYWORD, WRITE_KEYWORD, EXEC_KEYWORD } from './normalize.js'

// Check the "read|write|execute" keywords
export const validateAccess = function (input, keywords) {
  const accesses = listAccesses(keywords)

  if (accesses.length !== 0 && !hasValidAccess(input, accesses)) {
    const invalidAccesses = listInvalidAccesses(input, accesses)
    throwAccessError(invalidAccesses)
  }
}

export const validateAccessAsync = async function (input, keywords) {
  const accesses = listAccesses(keywords)

  if (accesses.length !== 0 && !(await hasValidAccessAsync(input, accesses))) {
    const invalidAccesses = await listInvalidAccessesAsync(input, accesses)
    throwAccessError(invalidAccesses)
  }
}

const listAccesses = function (keywords) {
  return ACCESS_METHODS.filter(({ keyword }) => keywords.has(keyword))
}

const ACCESS_METHODS = [
  { keyword: READ_KEYWORD, flag: constants.R_OK, name: 'readable' },
  { keyword: WRITE_KEYWORD, flag: constants.W_OK, name: 'writable' },
  { keyword: EXEC_KEYWORD, flag: constants.X_OK, name: 'executable' },
]

const hasValidAccess = function (input, accesses) {
  const flags = listFlags(accesses)
  return checkAccess(input, flags)
}

const hasValidAccessAsync = async function (input, accesses) {
  const flags = listFlags(accesses)
  return await checkAccessAsync(input, flags)
}

const listFlags = function (accesses) {
  return accesses.reduce(orFlag, constants.F_OK)
}

const orFlag = function (flags, { flag }) {
  // eslint-disable-next-line no-bitwise
  return flags | flag
}

const listInvalidAccesses = function (input, accesses) {
  const names = accesses.map(({ flag, name }) =>
    getInvalidAccess(input, flag, name),
  )
  return joinAccessNames(names)
}

const listInvalidAccessesAsync = async function (input, accesses) {
  const names = await Promise.all(
    accesses.map(({ flag, name }) => getInvalidAccessAsync(input, flag, name)),
  )
  return joinAccessNames(names)
}

const getInvalidAccess = function (input, flag, name) {
  return checkAccess(input, flag) ? undefined : name
}

const getInvalidAccessAsync = async function (input, flag, name) {
  return (await checkAccessAsync(input, flag)) ? undefined : name
}

const joinAccessNames = function (names) {
  return names.filter(Boolean).join(' and ')
}

export const checkAccess = function (input, flags) {
  try {
    accessSync(input, flags)
    return true
  } catch {
    return false
  }
}

export const checkAccessAsync = async function (input, flags) {
  try {
    await access(input, flags)
    return true
  } catch {
    return false
  }
}

const throwAccessError = function (invalidAccesses) {
  throw new Error(`must be ${invalidAccesses}.`)
}
