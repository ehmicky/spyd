import { accessSync, constants } from 'node:fs'
import { access } from 'node:fs/promises'

import { EXEC_KEYWORD, READ_KEYWORD, WRITE_KEYWORD } from './normalize.js'

// Check the "read|write|execute" keywords
export const validateAccess = (input, keywords) => {
  const accesses = listAccesses(keywords)

  if (accesses.length !== 0 && !hasValidAccess(input, accesses)) {
    const invalidAccesses = listInvalidAccesses(input, accesses)
    throwAccessError(invalidAccesses)
  }
}

export const validateAccessAsync = async (input, keywords) => {
  const accesses = listAccesses(keywords)

  if (accesses.length !== 0 && !(await hasValidAccessAsync(input, accesses))) {
    const invalidAccesses = await listInvalidAccessesAsync(input, accesses)
    throwAccessError(invalidAccesses)
  }
}

const listAccesses = (keywords) =>
  ACCESS_METHODS.filter(({ keyword }) => keywords.has(keyword))

const ACCESS_METHODS = [
  { keyword: READ_KEYWORD, flag: constants.R_OK, name: 'readable' },
  { keyword: WRITE_KEYWORD, flag: constants.W_OK, name: 'writable' },
  { keyword: EXEC_KEYWORD, flag: constants.X_OK, name: 'executable' },
]

const hasValidAccess = (input, accesses) => {
  const flags = listFlags(accesses)
  return checkAccess(input, flags)
}

const hasValidAccessAsync = async (input, accesses) => {
  const flags = listFlags(accesses)
  return await checkAccessAsync(input, flags)
}

const listFlags = (accesses) => accesses.reduce(orFlag, constants.F_OK)

// eslint-disable-next-line no-bitwise
const orFlag = (flags, { flag }) => flags | flag

const listInvalidAccesses = (input, accesses) => {
  const names = accesses.map(({ flag, name }) =>
    getInvalidAccess(input, flag, name),
  )
  return joinAccessNames(names)
}

const listInvalidAccessesAsync = async (input, accesses) => {
  const names = await Promise.all(
    accesses.map(({ flag, name }) => getInvalidAccessAsync(input, flag, name)),
  )
  return joinAccessNames(names)
}

const getInvalidAccess = (input, flag, name) =>
  checkAccess(input, flag) ? undefined : name

const getInvalidAccessAsync = async (input, flag, name) =>
  (await checkAccessAsync(input, flag)) ? undefined : name

const joinAccessNames = (names) => names.filter(Boolean).join(' and ')

export const checkAccess = (input, flags) => {
  try {
    accessSync(input, flags)
    return true
  } catch {
    return false
  }
}

export const checkAccessAsync = async (input, flags) => {
  try {
    await access(input, flags)
    return true
  } catch {
    return false
  }
}

const throwAccessError = (invalidAccesses) => {
  throw new Error(`must be ${invalidAccesses}.`)
}
