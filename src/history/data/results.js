import pMap from 'p-map'

import { getReadHistoryDir, getWriteHistoryDir } from './dir.js'
import { parseFilename, serializeFilename } from './filename.js'
import {
  checkHistoryFile,
  deleteRawResult,
  listFilenames,
  readRawResult,
  writeRawResult,
} from './fs.js'

// Retrieve all rawResults' metadata, which are stored in the filenames
export const listMetadata = async (cwd) => {
  const historyDir = await getReadHistoryDir(cwd)

  if (historyDir === undefined) {
    return []
  }

  const filenames = await listFilenames(historyDir)
  const metadata = filenames.map(parseFilename).filter(Boolean)
  return metadata
}

// Retrieve the contents of specific rawResults, stored on the filesystem,
// by using their metadata.
// Order must be preserved.
export const fetchRawResults = async (metadata, cwd) => {
  const historyDir = await getReadHistoryDir(cwd)

  if (historyDir === undefined) {
    return []
  }

  const rawResultStrs = await pMap(
    metadata,
    (metadatum) => fetchRawResult(metadatum, historyDir),
    { concurrency: MAX_CONCURRENCY },
  )
  return rawResultStrs
}

// How many results can be read at once.
// A lower value is slower.
// A higher value is more likely to crash on some machines.
const MAX_CONCURRENCY = 100

// Retrieve the contents of a rawResult, by using its metadatum
const fetchRawResult = async (metadatum, historyDir) => {
  const filename = serializeFilename(metadatum)
  const path = `${historyDir}/${filename}`
  await checkHistoryFile(path)
  const rawResultStr = await readRawResult(path)
  return rawResultStr
}

// Save a new rawResult
export const addRawResult = async (metadatum, rawResultStr, cwd) => {
  const historyDir = await getWriteHistoryDir(cwd)
  const filename = serializeFilename(metadatum)
  const path = `${historyDir}/${filename}`
  await writeRawResult(path, rawResultStr)
}

// Remove a rawResult from the filesystem
export const removeRawResults = async (metadata, cwd) => {
  const historyDir = await getReadHistoryDir(cwd)

  if (historyDir === undefined) {
    return
  }

  await Promise.all(
    metadata.map((metadatum) => removeRawResult(metadatum, historyDir)),
  )
}

const removeRawResult = async (metadatum, historyDir) => {
  const filename = serializeFilename(metadatum)
  const path = `${historyDir}/${filename}`
  await deleteRawResult(path)
}
