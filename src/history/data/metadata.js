// Retrieve filename from a rawResult
export const getRawResultFilename = function (rawResult) {
  const { id, timestamp } = rawResult
  const filename = serializeFilename({ id, timestamp })
  return filename
}

// Retrieve filename from a metadatum
export const serializeFilename = function ({ id, timestamp }) {
  const timestampStr = serializeTimestamp(timestamp)
  const filename = `${timestampStr}--${id}.json`
  return filename
}

const serializeTimestamp = function (timestamp) {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDay()
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()
  return `${year}-${month}-${day}--${hours}-${minutes}-${seconds}`
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
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})--(?<hours>\d{2})-(?<minutes>\d{2})-(?<seconds>\d{2})--(?<id>[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})\.json$/u
