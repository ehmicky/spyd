import compute from './compute.js'
import condition from './condition.js'
import defaultKeyword from './default.js'
import glob from './glob.js'
import path from './path/main.js'
import pick from './pick.js'
import rename from './rename.js'
import required from './required.js'
import schema from './schema.js'
import transform from './transform.js'
import validate from './validate.js'
// eslint-disable-next-line import/max-dependencies
import warn from './warn.js'

export const KEYWORDS = [
  pick,
  condition,
  compute,
  defaultKeyword,
  required,
  schema,
  glob,
  path,
  validate,
  warn,
  transform,
  rename,
]
