import execa from 'execa'

// Runtime description for this runner, specified as `command.versions`
// Used by the `--info` option
export const getCommandDescription = async function ({
  commandTitle,
  versions,
  runnerId,
}) {
  if (versions.length === 0) {
    return commandTitle
  }

  const versionsA = await Promise.all(
    versions.map(({ name, value }) => getVersion({ name, value, runnerId })),
  )
  const versionsB = versionsA.join(', ')
  return `${commandTitle} (${versionsB})`
}

// `versions[*].value` can either be a CLI command (array of strings) or
// the result directly (string)
const getVersion = async function ({ name, value, runnerId }) {
  const nameA = name === undefined ? '' : `${name} `

  if (typeof value === 'string') {
    return `${nameA}${value}`
  }

  const [file, ...args] = value

  try {
    const { stdout } = await execa(file, args, { preferLocal: true })
    const version = stdout.replace(LEADING_V, '')
    return `${nameA}${version}`
  } catch (error) {
    throw new Error(
      `Could not load runner '${runnerId}'\n\n${error.shortMessage}`,
    )
  }
}

const LEADING_V = /^v/u
