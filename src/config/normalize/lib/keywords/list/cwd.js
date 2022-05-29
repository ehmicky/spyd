import { stat } from 'fs/promises'
import { resolve } from 'path'

const main = async function (definition) {
  await validateCwd(definition)
  const cwd = resolve(definition)
  return { info: { cwd } }
}

// Errors in `cwd` are not user errors, i.e. should not start with `must`
const validateCwd = async function (cwd) {
  if (typeof cwd !== 'string') {
    throw new TypeError('It must be a string.')
  }

  const cwdStat = await getStat(cwd)

  if (!cwdStat.isDirectory()) {
    throw new Error('It must be a directory.')
  }
}

const getStat = async function (cwd) {
  try {
    return await stat(cwd)
  } catch (error) {
    throw error.code === 'ENOENT'
      ? new Error('It must be an existing file')
      : error
  }
}

// A `cwd[(info)]` rule can be specified to customize `info.cwd`.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'cwd',
  undefinedInput: true,
  main,
}
