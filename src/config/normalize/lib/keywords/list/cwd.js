import { statSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cwd as getCwd } from 'node:process'

const normalize = (definition) => {
  validateCwd(definition)
  return resolve(definition)
}

const normalizeAsync = async (definition) => {
  await validateCwdAsync(definition)
  return resolve(definition)
}

const validateCwd = (definition) => {
  validateCwdString(definition)
  const cwdStat = getStat(definition)
  validateCwdStat(cwdStat)
}

const validateCwdAsync = async (definition) => {
  validateCwdString(definition)
  const cwdStat = await getStatAsync(definition)
  validateCwdStat(cwdStat)
}

const validateCwdString = (definition) => {
  if (typeof definition !== 'string') {
    throw new TypeError('must be a string.')
  }
}

const getStat = (definition) => {
  try {
    return statSync(definition)
  } catch (error) {
    throw handleStatError(error)
  }
}

const getStatAsync = async (definition) => {
  try {
    return await stat(definition)
  } catch (error) {
    throw handleStatError(error)
  }
}

const handleStatError = (error) =>
  error.code === 'ENOENT' ? new Error('must be an existing file.') : error

const validateCwdStat = (cwdStat) => {
  if (!cwdStat.isDirectory()) {
    throw new Error('must be a directory.')
  }
}

const main = (definition) => ({ info: { cwd: definition } })

// A `cwd[(info)]` rule can be specified to customize `info.cwd`.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'cwd',
  undefinedInput: true,
  exampleDefinition: getCwd(),
  normalize,
  normalizeAsync,
  main,
}
