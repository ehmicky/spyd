import execa from 'execa'

import { UserError } from '../../error/main.js'

// Find a result by git reference (commit/branch/tag).
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
  const timestamp = Number(stdout) * SECS_TO_MSECS

  if (!Number.isInteger(timestamp) || timestamp <= 0) {
    throw new UserError('does not match anything in the git repository')
  }

  return results.findIndex((result) => result.timestamp >= timestamp)
}

const SECS_TO_MSECS = 1e3
