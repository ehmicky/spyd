import omit from 'omit.js'

import { prettifyGit, prettifyPr } from './git.js'

// Serialize `system` information for CLI reporters.
export const getSharedSystem = function (systems) {
  if (systems === undefined) {
    return
  }

  const [sharedSystem] = systems
  return getFields(sharedSystem)
}

export const getSystems = function (systems) {
  if (systems === undefined) {
    return
  }

  const fields = systems.slice(1).map(getSystemFields)
  return Object.assign({}, ...fields)
}

const getSystemFields = function ({ title, ...system }) {
  const fields = getFields(system)
  return { [title]: fields }
}

const getFields = function ({
  machine: { os, cpu, memory } = {},
  git: { commit, tag, branch, prNumber, prBranch } = {},
  ci,
  versions = {},
}) {
  const fields = {
    OS: os,
    CPU: cpu,
    Memory: memory,
    Git: prettifyGit({ commit, tag, branch }),
    PR: prettifyPr({ prNumber, prBranch }),
    CI: ci,
  }
  return {
    ...fields,
    ...omit(versions, Object.keys(fields)),
  }
}
