// Retrieve filename from a rawResult
export const getRawResultFilename = function (rawResult) {
  const { id, timestamp } = rawResult
  return serializeFilename({ id, timestamp })
}

// Retrieve filename from a metadatum
export const serializeFilename = function ({ id, timestamp }) {
  const timestampStr = serializeTimestamp(timestamp)
  return `${timestampStr}_${id}.json`
}

const serializeTimestamp = function (timestamp) {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = padTimeField(date.getUTCMonth() + 1)
  const day = padTimeField(date.getUTCDate())
  const hours = padTimeField(date.getUTCHours())
  const minutes = padTimeField(date.getUTCMinutes())
  const seconds = padTimeField(date.getUTCSeconds())
  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`
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

  const { id } = result.groups
  const timestamp = parseTimestamp(result.groups)
  return { id, timestamp }
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
  /^(?<year>\d{4})_(?<month>\d{2})_(?<day>\d{2})_(?<hours>\d{2})_(?<minutes>\d{2})_(?<seconds>\d{2})_(?<id>[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})\.json$/u
