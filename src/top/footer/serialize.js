import { format as formatBytes } from 'bytes'
import { excludeKeys } from 'filter-obj'

import { cleanObject } from '../../utils/clean.js'

// Serialize info|system-related information as a `footer` for reporters
export const serializeFooter = ({ id, timestamp, systems, ...footer }) => {
  const metadata = serializeMetadata(id, timestamp)
  const systemsA = systems.map(serializeSystem).filter(hasProps)
  return { ...footer, ...metadata, systems: systemsA }
}

const serializeMetadata = (id, timestamp) =>
  cleanObject({ Id: id, Timestamp: timestamp })

const serializeSystem = ({
  dimensions,
  machine: { os, cpus, memory } = {},
  git: { commit, tag, branch, prNumber, prBranch } = {},
  ci,
  versions = {},
}) => {
  const props = {
    OS: os,
    CPU: serializeCpus(cpus),
    Memory: serializeMemory(memory),
    Git: serializeGit(commit, tag, branch),
    PR: serializePr(prNumber, prBranch),
    CI: ci,
  }
  const propsA = cleanObject({
    ...props,
    ...serializeVersions(versions, props),
  })
  return { dimensions, props: propsA }
}

const serializeCpus = (cpus) =>
  cpus === undefined ? undefined : cpus.map(serializeCpu).join(', ')

const serializeCpu = ({ cores, model }) => `${cores} * ${model}`

const serializeMemory = (memory) =>
  memory === undefined ? undefined : formatBytes(memory, { decimalPlaces: 0 })

const serializeGit = (commit, tag, branch) =>
  commit === undefined && tag === undefined
    ? undefined
    : `${getHash(commit, tag)}${getBranch(branch)}`

const getHash = (commit, tag) =>
  tag === undefined ? commit.slice(0, COMMIT_SIZE) : tag

const COMMIT_SIZE = 8

const serializePr = (prNumber, prBranch) =>
  prNumber === undefined ? undefined : `#${prNumber}${getBranch(prBranch)}`

const getBranch = (branch) => (branch === undefined ? '' : ` (${branch})`)

const serializeVersions = ({ Spyd: spydVersion, ...versions }, props) => ({
  ...excludeKeys(versions, Object.keys(props)),
  [SPYD_VERSION_NAME]: spydVersion,
})

// The spyd version is shown after other versions.
// It has a longer name than just `spyd` to make it clear "spyd" is the tool
// used for benchmarking.
const SPYD_VERSION_NAME = 'Benchmarked with spyd'

const hasProps = (props) => Object.keys(props).length !== 0

// Order where each property should be shown in the footer.
// The empty string stands for dynamic properties like versions.
export const PROP_ORDER = [
  'OS',
  'CPU',
  'Memory',
  'Git',
  'PR',
  'CI',
  '',
  SPYD_VERSION_NAME,
]
