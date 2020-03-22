import slugify from 'slugify'

import { replaceSystemVars } from './vars.js'

// Normalize 'system' option
export const normalizeSystem = async function ({ system, run, ...opts }) {
  const title = system.trim()
  const titleA = await replaceSystemVars(title, run)
  const id = slugify(titleA, { lower: true, remove: INVALID_ID_REGEXP })
  return { ...opts, run, system: { id, title: titleA } }
}

const INVALID_ID_REGEXP = /[^ a-zA-Z\d_.-]/gu
