import { cleanObject } from '../../utils/clean.js'

// Retrieve filename from a rawResult
export const getRawResultFilename = function (rawResult) {
  const { id, mergeId, timestamp } = rawResult
  const filename = serializeFilename({ id, mergeId, timestamp })
  return filename
}

// Retrieve filename from a metadatum
export const serializeFilename = function ({ id, mergeId, timestamp }) {
  const mergeIdStr = mergeId === undefined ? '' : `--${mergeId}`
  const timestampStr = serializeTimestamp(timestamp)
  const filename = `${timestampStr}${mergeIdStr}--${id}.json`
  return filename
}

const serializeTimestamp = function (timestamp) {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = padTimeField(date.getUTCMonth() + 1)
  const day = padTimeField(date.getUTCDate())
  const hours = padTimeField(date.getUTCHours())
  const minutes = padTimeField(date.getUTCMinutes())
  const seconds = padTimeField(date.getUTCSeconds())
  return `${year}-${month}-${day}--${hours}-${minutes}-${seconds}`
}

const padTimeField = function (timeField) {
  return String(timeField).padStart(2, '0')
}

// Retrieve metadatum from a filename
export const parseFilename = function (filename) {
  const result = RESULT_FILENAME_REGEXP.exec(filename)

  if (result === null) {
    return
  }

  const { id, mergeId } = result.groups
  const timestamp = parseTimestamp(result.groups)
  return cleanObject({ id, mergeId, timestamp })
}

const parseTimestamp = function ({
  year,
  month,
  day,
  hours,
  minutes,
  seconds,
}) {
  const date = new Date(
    `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`,
  )
  return Number(date)
}

const RESULT_FILENAME_REGEXP =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})--(?<hours>\d{2})-(?<minutes>\d{2})-(?<seconds>\d{2})(--(?<mergeId>[\w-]+))?--(?<id>[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})\.json$/u
