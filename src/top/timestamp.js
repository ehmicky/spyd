// `result.timestamp` is stored as an integer, for flexibility
export const getTimestamp = () => Date.now()

// The timezone is:
//  - Local when the output is interactive, UTC otherwise.
//  - This is because an interactive terminal expects a single viewer, but other
//    outputs might be shared and viewed by several people
//  - We only print it when UTC since users might expect timezone to be local
export const normalizeTimestamp = ({ timestamp }, tty) => {
  const date = new Date(timestamp)
  const { timestampFields, timezone } = tty
    ? getLocalTimestampFields(date)
    : getUTCTimestampFields(date)
  const [year, month, day, hours, minutes, seconds] =
    timestampFields.map(padZeros)
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${timezone}`
}

const getLocalTimestampFields = (date) => {
  const timestampFields = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ]
  return { timestampFields, timezone: '' }
}

const getUTCTimestampFields = (date) => {
  const timestampFields = [
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ]
  return { timestampFields, timezone: ' UTC' }
}

const padZeros = (integer) => String(integer).padStart(2, '0')
