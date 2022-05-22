import { constants } from 'fs'
import { access } from 'fs/promises'

import { READ_KEYWORD, WRITE_KEYWORD, EXEC_KEYWORD } from './check.js'

// Check the "read|write|execute" keywords
export const validateAccess = async function (value, keywords) {
  const accesses = ACCESS_METHODS.filter(({ keyword }) => keywords.has(keyword))

  if (accesses.length !== 0 && !(await hasValidAccess(value, accesses))) {
    const invalidAccesses = await listInvalidAccesses(value, accesses)
    throw new Error(`must be ${invalidAccesses}.`)
  }
}

const ACCESS_METHODS = [
  { keyword: READ_KEYWORD, flag: constants.R_OK, name: 'readable' },
  { keyword: WRITE_KEYWORD, flag: constants.W_OK, name: 'writable' },
  { keyword: EXEC_KEYWORD, flag: constants.X_OK, name: 'executable' },
]

const hasValidAccess = async function (value, accesses) {
  const flags = accesses.reduce(orFlag, constants.F_OK)
  return await checkAccess(value, flags)
}

const orFlag = function (flags, { flag }) {
  // eslint-disable-next-line no-bitwise
  return flags | flag
}

const listInvalidAccesses = async function (value, accesses) {
  const names = await Promise.all(
    accesses.map(({ flag, name }) => getInvalidAccess(value, flag, name)),
  )
  return names.filter(Boolean).join(' and ')
}

const getInvalidAccess = async function (value, flag, name) {
  return (await checkAccess(value, flag)) ? undefined : name
}

export const checkAccess = async function (value, flags) {
  try {
    await access(value, flags)
    return true
  } catch {
    return false
  }
}
