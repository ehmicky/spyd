import { getPath } from 'nve'

import { getOpts } from './options.js'
import { getNodeVersions } from './versions.js'

const START_PATH = `${__dirname}/start.js`

export const action = async function(runOpts) {
  const runOptsA = getOpts(runOpts)

  const versions = await getNodeVersions(runOptsA)

  if (versions === undefined) {
    return [
      {
        value: ['node', START_PATH],
        versions: [{ value: ['node', '--version'] }],
      },
    ]
  }

  const commands = await Promise.all(versions.map(getNodeCommand))
  return commands
}

const getNodeCommand = async function({ version, fullVersion }) {
  const nodePath = await getPath(fullVersion, false)
  const versions = version === fullVersion ? [] : [{ value: fullVersion }]
  return {
    id: version,
    title: version,
    value: [nodePath, START_PATH],
    versions,
  }
}
