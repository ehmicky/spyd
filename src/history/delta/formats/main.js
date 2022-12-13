import { countFormat } from './count.js'
import { durationFormat } from './duration.js'
import { firstFormat } from './first.js'
import { gitFormat } from './git.js'
import { idFormat } from './id.js'
import { timestampFormat } from './timestamp.js'

export const findFormat = (type) =>
  FORMATS.find((format) => format.type === type)

// Order matters since the first successful parse() is used
export const FORMATS = [
  countFormat,
  firstFormat,
  timestampFormat,
  idFormat,
  durationFormat,
  gitFormat,
]
