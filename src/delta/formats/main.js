import { commitFormat } from './commit.js'
import { countFormat } from './count.js'
import { durationFormat } from './duration.js'
import { firstFormat } from './first.js'
import { idFormat } from './id.js'
import { tagFormat } from './tag.js'
import { timestampFormat } from './timestamp.js'

export const findFormat = function (type) {
  return FORMATS.find((format) => format.type === type)
}

// Order matters since the first successful parse() is used
export const FORMATS = [
  countFormat,
  firstFormat,
  timestampFormat,
  idFormat,
  durationFormat,
  commitFormat,
  tagFormat,
]
