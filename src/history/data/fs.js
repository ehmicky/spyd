import { readdir, readFile, writeFile, unlink, mkdir } from 'fs/promises'

import { pathExists } from 'path-exists'
import { isDirectory, isFile } from 'path-type'

import { UserError } from '../../error/main.js'

// Find all filenames of the history directory
export const listFilenames = async function (historyDir) {
  return await readdir(historyDir)
}

// Read a rawResult's contents
export const readRawResult = async function (path) {
  try {
    return await readFile(path, 'utf8')
  } catch (cause) {
    throw new UserError('History file could not be read.', { cause })
  }
}

// Write a rawResult's contents
export const writeRawResult = async function (path, rawResultStr) {
  try {
    return await writeFile(path, rawResultStr)
  } catch (cause) {
    throw new UserError('History file could not be written.', { cause })
  }
}

// Delete a rawResult from the filesystem
export const deleteRawResult = async function (path) {
  try {
    await unlink(path)
  } catch (cause) {
    throw new UserError('History file could not be deleted.', { cause })
  }
}

// Check if a rawResult is on the filesystem
export const hasHistoryDir = async function (historyDir) {
  return await pathExists(historyDir)
}

// Ensure that the history directory exists on the filesystem
export const ensureHistoryDir = async function (historyDir) {
  if (await pathExists(historyDir)) {
    return
  }

  try {
    await mkdir(historyDir, { recursive: true })
  } catch (cause) {
    throw new UserError(`Could not create history directory "${historyDir}"`, {
      cause,
    })
  }
}

// Ensure that the history directory is valid
export const checkHistoryDir = async function (historyDir) {
  if (!(await isDirectory(historyDir))) {
    throw new UserError(
      `The history location must be a directory, not a regular file: ${historyDir}`,
    )
  }
}

// Ensure that a history file is valid
export const checkHistoryFile = async function (path) {
  if (!(await isFile(path))) {
    throw new UserError(`History file must be a regular file: ${path}`)
  }
}
