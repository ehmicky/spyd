/* eslint-disable import/no-namespace */
import * as defaultKeyword from './default.js'
import * as glob from './glob.js'
import * as path from './path/main.js'
import * as rename from './rename.js'
import * as required from './required.js'
import * as schema from './schema.js'
import * as transform from './transform.js'
import * as validate from './validate.js'
import * as warn from './warn.js'
/* eslint-enable import/no-namespace */

export const KEYWORDS = [
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
