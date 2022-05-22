import { pathExists } from 'path-exists'
import { isFile, isDirectory } from 'path-type'

export const validateFileExists = async function (value) {
  if (!(await pathExists(value))) {
    throw new Error('must be an existing file.')
  }
}

export const validateRegularFile = async function (value) {
  if ((await pathExists(value)) && !(await isFile(value))) {
    throw new Error('must be a regular file.')
  }
}

export const validateDirectory = async function (value) {
  if ((await pathExists(value)) && !(await isDirectory(value))) {
    throw new Error('must be a directory.')
  }
}
