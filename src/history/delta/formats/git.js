import execa from 'execa'

import { UserError } from '../../../error/main.js'

// Find a result by git reference (commit/branch/tag).
export const findByGitRef = async function (results, gitRef, cwd) {
  const { stdout, stderr, message, failed } = await execa(
    'git',
    [
      'show',
      '--no-color',
      '--no-patch',
      '--no-notes',
      '--pretty=%ad',
      '--date=unix',
      gitRef,
    ],
    { cwd, reject: false, stdin: 'ignore' },
  )

  const timestamp = Number(stdout) * SECS_TO_MSECS
  checkTimestamp({ timestamp, stderr, message, failed, cwd })

  return results.findIndex((result) => result.timestamp >= timestamp)
}

const SECS_TO_MSECS = 1e3

// Error handling when looking for the `git` reference
const checkTimestamp = function ({ timestamp, stderr, message, failed, cwd }) {
  if (stderr.includes(NOT_REPOSITORY_MESSAGE)) {
    throw new UserError(
      `is invalid because no git repository could be found in ${cwd}`,
    )
  }

  if (stderr.includes(UNKNOWN_REV_MESSAGE)) {
    throw new UserError('does not match any reference in the git repository.')
  }

  if (!isTimestamp(timestamp, failed)) {
    throw new UserError(
      `could not be resolved in the git repository.\n${message}`,
    )
  }
}

const NOT_REPOSITORY_MESSAGE = 'not a git repository'
const UNKNOWN_REV_MESSAGE = 'unknown revision'

const isTimestamp = function (timestamp, failed) {
  return !failed && Number.isInteger(timestamp) && timestamp > 0
}
