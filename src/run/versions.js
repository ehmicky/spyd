import { execFile } from 'child_process'
import { promisify } from 'util'

const pExecFile = promisify(execFile)

// Runtime versions for this runner, specified as `action.versions`
// Used by the `--system` option
export const getVersions = async function({ versions, runnerId }) {
  const versionsA = await Promise.all(
    versions.map(({ title, value }) => getVersion({ title, value, runnerId })),
  )
  return versionsA
}

// `versions[*].value` can either be a CLI command (array of strings) or
// the result directly (string)
const getVersion = async function({ title, value, runnerId }) {
  if (typeof value === 'string') {
    return [title, value]
  }

  const [file, ...args] = value

  try {
    const { stdout } = await pExecFile(file, args)
    const version = stdout.trim()
    return [title, version]
  } catch (error) {
    throw new Error(`Could not load runner '${runnerId}'\n\n${error.message}`)
  }
}

// Concatenate the `versions` of all runners
export const loadVersions = function(runners) {
  return Object.fromEntries(runners.flatMap(getVersionsField))
}

const getVersionsField = function({ versions }) {
  return versions
}
