/* eslint-disable import/no-namespace */
import * as compute from './compute.js'
import * as condition from './condition.js'
import * as defaultKeyword from './default.js'
import * as glob from './glob.js'
import * as path from './path/main.js'
import * as pick from './pick.js'
import * as rename from './rename.js'
import * as required from './required.js'
import * as schema from './schema.js'
import * as transform from './transform.js'
import * as validate from './validate.js'
// eslint-disable-next-line import/max-dependencies
import * as warn from './warn.js'
/* eslint-enable import/no-namespace */

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
