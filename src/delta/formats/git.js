import execa from 'execa'

import { UserError } from '../../error/main.js'

// Find a result by git reference (commit/branch/tag).
// We use the most recent result because this is what users most likely want.
export const findByGitRef = async function (results, gitRef) {
  const { stdout } = await execa(
    'git',
    [
      'show',
      '--no-color',
      '--no-patch',
      '--no-notes',
      '--pretty=%cd',
      '--date=unix',
      gitRef,
    ],
    { reject: false, stdin: 'ignore', stderr: 'ignore' },
  )
  const unixTime = Number(stdout)

  if (!Number.isInteger(unixTime) || unixTime <= 0) {
    throw new UserError('does not match anything in the git repository')
  }

  const timestamp = new Date(unixTime).toISOString()
  return results.findIndex((result) => result.timestamp >= timestamp)
}
