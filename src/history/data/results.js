import pMap from 'p-map'

import { parseRawResult, serializeRawResult } from './contents.js'
import { getReadHistoryDir, getWriteHistoryDir } from './dir.js'
import { parseFilename, serializeFilename } from './filename.js'
import {
  listFilenames,
  readRawResult,
  writeRawResult,
  deleteRawResult,
  checkHistoryFile,
} from './fs.js'

// Retrieve all rawResults' metadata, which are stored in the filenames
export const listMetadata = async function (cwd) {
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
export const fetchRawResults = async function (metadata, cwd) {
  const historyDir = await getReadHistoryDir(cwd)

  if (historyDir === undefined) {
    return []
  }

  const rawResults = await pMap(
    metadata,
    (metadatum) => fetchRawResult(metadatum, historyDir),
    { concurrency: MAX_CONCURRENCY },
  )
  return rawResults
}

// How many results can be read at once.
// A lower value is slower.
// A higher value is more likely to crash on some machines.
const MAX_CONCURRENCY = 100

// Retrieve the contents of a rawResult, by using its metadatum
const fetchRawResult = async function (metadatum, historyDir) {
  const filename = serializeFilename(metadatum)
  const path = `${historyDir}/${filename}`
  await checkHistoryFile(path)
  const contents = await readRawResult(path)
  const rawResult = parseRawResult(contents)
  return rawResult
}

// Save a new rawResult
export const addRawResult = async function (metadatum, rawResult, cwd) {
  const historyDir = await getWriteHistoryDir(cwd)
  const filename = serializeFilename(metadatum)
  const path = `${historyDir}/${filename}`
  const contents = serializeRawResult(rawResult)
  await writeRawResult(path, contents)
}

// Remove a rawResult from the filesystem
export const removeRawResult = async function (metadatum, cwd) {
  const historyDir = await getReadHistoryDir(cwd)

  if (historyDir === undefined) {
    return
  }

  const filename = serializeFilename(metadatum)
  const path = `${historyDir}/${filename}`
  await deleteRawResult(path)
}
