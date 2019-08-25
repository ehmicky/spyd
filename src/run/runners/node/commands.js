import { getPath } from 'nve'

import { getOpts } from './options.js'
import { getNodeVersions } from './versions.js'

const START_PATH = `${__dirname}/start.js`

export const commands = async function(runOpts) {
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

  return Promise.all(versions.map(getNodeCommand))
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
