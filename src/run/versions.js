import { execFile } from 'child_process'
import { promisify } from 'util'

import stripFinalNewline from 'strip-final-newline'

const pExecFile = promisify(execFile)

// Retrieve runners runtime versions.
// Only show versions of runners actually used by some task files.
// This also makes sure runtimes exist.
export const getVersions = async function(iterations) {
  const runners = getRunners(iterations)
  const versions = await getRunnersVersions(runners)
  return versions
}

const getRunners = function(iterations) {
  const runnerIds = iterations.map(getRunnerId)
  const runnerIdsA = [...new Set(runnerIds)]
  const runners = runnerIdsA.map(runnerId => getRunner(iterations, runnerId))
  return runners
}

const getRunnerId = function({ runnerId }) {
  return runnerId
}

const getRunner = function(iterations, runnerId) {
  const {
    runner: { versions, runOpt },
  } = iterations.find(iteration => iteration.runnerId === runnerId)
  return { runnerId, versions, runOpt }
}

const getRunnersVersions = async function(runners) {
  const promises = runners.map(getRunnerVersions)
  const versions = await Promise.all(promises)
  const versionsA = versions.flat()
  const versionsB = Object.fromEntries(versionsA)
  return versionsB
}

export const getRunnerVersions = async function({
  runnerId,
  versions,
  runOpt,
}) {
  const versionsA = versions(runOpt)
  const promises = versionsA.map(({ title, version }) =>
    getVersion({ title, version, runnerId }),
  )
  const versionsB = await Promise.all(promises)
  return versionsB
}

const getVersion = async function({
  title,
  version: [file, ...args],
  runnerId,
}) {
  try {
    const { stdout } = await pExecFile(file, args)
    const version = stripFinalNewline(stdout)
    return [title, version]
  } catch (error) {
    throw new Error(`Could not load runner '${runnerId}'\n\n${error.stack}`)
  }
}
