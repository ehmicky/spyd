import { statSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cwd as getCwd } from 'node:process'

const normalize = function (definition) {
  validateCwd(definition)
  return resolve(definition)
}

const normalizeAsync = async function (definition) {
  await validateCwdAsync(definition)
  return resolve(definition)
}

const validateCwd = function (definition) {
  validateCwdString(definition)
  const cwdStat = getStat(definition)
  validateCwdStat(cwdStat)
}

const validateCwdAsync = async function (definition) {
  validateCwdString(definition)
  const cwdStat = await getStatAsync(definition)
  validateCwdStat(cwdStat)
}

const validateCwdString = function (definition) {
  if (typeof definition !== 'string') {
    throw new TypeError('must be a string.')
  }
}

const getStat = function (definition) {
  try {
    return statSync(definition)
  } catch (error) {
    throw handleStatError(error)
  }
}

const getStatAsync = async function (definition) {
  try {
    return await stat(definition)
  } catch (error) {
    throw handleStatError(error)
  }
}

const handleStatError = function (error) {
  return error.code === 'ENOENT'
    ? new Error('must be an existing file.')
    : error
}

const validateCwdStat = function (cwdStat) {
  if (!cwdStat.isDirectory()) {
    throw new Error('must be a directory.')
  }
}

const main = function (definition) {
  return { info: { cwd: definition } }
}

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
