import { compressRawResult } from './compress.js'
import { parseRawResult, serializeRawResult } from './contents.js'
import { decompressRawResult } from './decompress.js'
import { migrateRawResult } from './migrate.js'

// Serialize a rawResult to a rawResultStr used by stores
export const normalizeRawResultSave = function (rawResult) {
  const rawResultA = compressRawResult(rawResult)
  const rawResultStr = serializeRawResult(rawResultA)
  return rawResultStr
}

// Parse a rawResultStr from stores to a rawResult.
// This operation must perfectly reverse the inverse one, so no information is
// lost when saving and loading a rawResult.
export const normalizeRawResultLoad = function (rawResultsStr) {
  const rawResult = parseRawResult(rawResultsStr)
  const rawResultA = migrateRawResult(rawResult)
  const rawResultB = decompressRawResult(rawResultA)
  return rawResultB
}