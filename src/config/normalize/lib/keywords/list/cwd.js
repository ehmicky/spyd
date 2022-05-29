import { stat } from 'fs/promises'
import { resolve } from 'path'

const normalize = async function (definition) {
  await validateCwd(definition)
  return resolve(definition)
}

const validateCwd = async function (definition) {
  if (typeof definition !== 'string') {
    throw new TypeError('It must be a string.')
  }

  const cwdStat = await getStat(definition)

  if (!cwdStat.isDirectory()) {
    throw new Error('It must be a directory.')
  }
}

const getStat = async function (definition) {
  try {
    return await stat(definition)
  } catch (error) {
    throw error.code === 'ENOENT'
      ? new Error('It must be an existing file')
      : error
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
  normalize,
  main,
}
