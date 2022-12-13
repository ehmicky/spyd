import { execa } from 'execa'

import { UserError } from '../../../error/main.js'

import { findByTime } from './find.js'

// Deltas can be git commits, tags or branches.
const parseGit = (delta) => {
  if (typeof delta !== 'string') {
    return
  }

  return delta
}

// Find a rawResult by git reference (commit/branch/tag).
const findByGit = async (metadataGroups, gitRef, cwd) => {
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
  return findByTime(metadataGroups, timestamp)
}

const SECS_TO_MSECS = 1e3

// Error handling when looking for the `git` reference
const checkTimestamp = ({ timestamp, stderr, message, failed, cwd }) => {
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

const isTimestamp = (timestamp, failed) =>
  !failed && Number.isInteger(timestamp) && timestamp > 0

export const gitFormat = {
  type: 'git',
  message: 'git commit, tag or branch',
  parse: parseGit,
  find: findByGit,
}
