import { pathExists } from 'path-exists'
import { isDirectory } from 'path-type'

export const validateFileExists = async function (value) {
  if (!(await pathExists(value))) {
    throw new Error('must be an existing file.')
  }
}

export const validateDirectory = async function (value) {
  if ((await pathExists(value)) && !(await isDirectory(value))) {
    throw new Error('must be a directory.')
  }
}
