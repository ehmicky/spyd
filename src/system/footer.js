import omit from 'omit.js'

import { addSystemsTitles } from '../report/contents/titles.js'
import { cleanObject } from '../utils/clean.js'

import { serializeGit, serializePr } from './git.js'

// Serialize info|system-related information as a `footer` for reporters
export const serializeFooter = function (
  { id, timestamp, systems, ...result },
  titles,
  showTitles,
) {
  const systemsA = addSystemsTitles(systems, titles, showTitles)
  const footer = [
    ...systemsA.map(serializeSystem),
    serializeMetadata(id, timestamp),
  ]
  return { ...result, footer }
}

const serializeSystem = function ({
  title,
  machine: { os, cpu, memory } = {},
  git: { commit, tag, branch, prNumber, prBranch } = {},
  ci,
  versions: { Spyd: spydVersion, ...versions } = {},
}) {
  return {
    title,
    fields: cleanObject({
      OS: os,
      CPU: cpu,
      Memory: memory,
      Git: serializeGit({ commit, tag, branch }),
      PR: serializePr({ prNumber, prBranch }),
      CI: ci,
      ...omit.default(versions, [...METADATA_SYSTEM_PROPS, ...MACHINE_PROPS]),
      [SPYD_VERSION_NAME]: spydVersion,
    }),
  }
}

export const METADATA_SYSTEM_PROPS = ['Id', 'Timestamp', 'Git', 'PR', 'CI']
export const MACHINE_PROPS = ['OS', 'CPU', 'Memory']

// The spyd version is shown after other versions.
// It has a longer name than just `spyd` to make it clear "spyd" is the tool
// used for benchmarking.
const SPYD_VERSION_NAME = 'Benchmarked with spyd'

const serializeMetadata = function (id, timestamp) {
  const timestampString = new Date(timestamp).toLocaleString()
  return { fields: { Id: id, Timestamp: timestampString } }
}

// Depending on format, it is either passed to the reporter or appended by us.
export const finalizeFooter = function ({ footer, ...result }, keepFooter) {
  const footerA = footer.filter(hasFields).map(normalizeDepth)
  const resultA = keepFooter ? { ...result, footer: footerA } : result
  return { result: resultA, footer: footerA }
}

const hasFields = function ({ fields }) {
  return Object.keys(fields).length !== 0
}

const normalizeDepth = function ({ title, fields }) {
  return title === undefined ? fields : { [title]: fields }
}
