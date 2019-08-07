#!/usr/bin/env node
import { platform, arch, argv, exit } from 'process'
import { createGunzip } from 'zlib'
import { spawn } from 'child_process'
import { readFile, writeFile, createWriteStream } from 'fs'
import { promisify } from 'util'

import { extract as tarExtract } from 'tar-fs'
import pEvent from 'p-event'
import findCacheDir from 'find-cache-dir'
import pathExists from 'path-exists'
import { validRange, clean as cleanRange, maxSatisfying, ltr } from 'semver'

import { cleanupOnError } from './cleanup.js'
import { fetchUrl } from './fetch.js'

const pReadFile = promisify(readFile)
const pWriteFile = promisify(writeFile)

const CACHE_DIR = findCacheDir({ name: 'nve', create: true })

// CLI that forwards its arguments to another node instance of a specific
// version range. The version range is specified as the first argument.
const runCli = async function() {
  try {
    const [versionRange, ...args] = argv.slice(2)
    const { exitCode } = await nve(versionRange, args)
    // Forward the exit code from the child process
    exit(exitCode)
  } catch (error) {
    // eslint-disable-next-line no-console, no-restricted-globals
    console.error(error.message)
    exit(1)
  }
}

// Forwards `args` to another node instance of a specific `versionRange`
const nve = async function(versionRange, args = []) {
  validateInput(versionRange, args)

  const versionA = await getVersion(versionRange)
  const { exitCode, signal } = await runNode(versionA, args)
  return { exitCode, signal }
}

// Validate input parameters
// `versionRange` can start with `v` or not.
const validateInput = function(versionRange, args) {
  validateVersion(versionRange)
  validateArgs(args)
}

const validateVersion = function(versionRange) {
  if (typeof versionRange !== 'string' || validRange(versionRange) === null) {
    throw new TypeError('First argument must be a valid Node version range')
  }
}

const validateArgs = function(args) {
  if (!Array.isArray(args) || !args.every(isString)) {
    throw new TypeError('Second argument must be an array of strings')
  }
}

const isString = function(arg) {
  return typeof arg === 'string'
}

// Retrieve the Node version matching a specific `versionRange`
const getVersion = async function(versionRange) {
  const versions = await getVersions(versionRange)

  const versionA = maxSatisfying(versions, versionRange)

  if (versionA === null) {
    throw new Error(`Invalid Node version: ${versionRange}`)
  }

  return versionA
}

// Retrieve all available Node versions
const getVersions = async function(versionRange) {
  const cachedVersions = await getCachedVersions(versionRange)

  if (cachedVersions !== undefined) {
    return cachedVersions
  }

  const versions = await fetchVersions()

  await cleanupOnError(() => cacheVersions(versions), VERSIONS_CACHE)

  return versions
}

// Fetch all available Node versions by making a HTTP request to Node website
// Versions are already sorted from newest to oldest
const fetchVersions = async function() {
  const response = await fetchUrl(INDEX_URL)
  const index = await response.json()
  const versions = index.map(getVersionField)
  return versions
}

const INDEX_URL = 'https://nodejs.org/dist/index.json'

const getVersionField = function({ version }) {
  return version.slice(1)
}

// We cache the HTTP request. The cache needs to be invalidated sometimes since
// new Node versions are made available every week. We only invalidate it when
// the requested `versionRange` targets the latest Node version.
// The cache is persisted to `./node_modules/.cache/nve/versions.json`.
// Also we also cache it in-memory so it's performed only once per process.
const getCachedVersions = async function(versionRange) {
  if (currentCachedVersions !== undefined) {
    return currentCachedVersions
  }

  if (!(await pathExists(VERSIONS_CACHE))) {
    return
  }

  const versions = await pReadFile(VERSIONS_CACHE, 'utf8')
  const versionsA = JSON.parse(versions)

  if (isLatestVersion(versionRange, versionsA)) {
    return
  }

  return versionsA
}

// If latest is 12.8.0, `versionRange` `12.8` should invalid cache, but not
// `12.8.0`. `13` should also invalidate it.
const isLatestVersion = function(versionRange, versions) {
  const matchesLatest =
    cleanRange(versionRange) === null &&
    maxSatisfying(versions, versionRange) === versions[0]
  return matchesLatest || ltr(versions[0], versionRange)
}

// Persist the cached versions
const cacheVersions = async function(versions) {
  await pWriteFile(VERSIONS_CACHE, JSON.stringify(versions, null, 2))
  // eslint-disable-next-line fp/no-mutation
  currentCachedVersions = versions
}

const VERSIONS_CACHE = `${CACHE_DIR}/versions.json`

// eslint-disable-next-line fp/no-let, init-declarations
let currentCachedVersions

// Download the Node binary for a specific `version` then run it with `args`
const runNode = async function(version, args) {
  const nodePath = await getNodePath(version)
  const { exitCode, signal } = await runNodeProcess(nodePath, args)
  return { exitCode, signal }
}

// Download the Node binary for a specific `version`.
// The binary is cached under `node_modules/.cache/nve/{version}/node`.
const getNodePath = async function(version) {
  const outputDir = `${CACHE_DIR}/${version}`
  const nodePath = `${outputDir}/${NODE_FILENAME}`

  if (await pathExists(nodePath)) {
    return nodePath
  }

  await cleanupOnError(
    () => downloadNode(version, outputDir, nodePath),
    nodePath,
  )

  return nodePath
}

// Retrieve the Node binary from the Node website and persist it
// The URL depends on the current OS and CPU architecture
const downloadNode = function(version, outputDir, nodePath) {
  if (platform === 'win32') {
    return downloadWindowsNode(version, nodePath)
  }

  return downloadUnixNode(version, outputDir)
}

// The Windows Node binary comes as a regular file
const downloadWindowsNode = async function(version, nodePath) {
  const { body } = await fetchUrl(
    `${URL_BASE}/v${version}/win-${arch}/${NODE_FILENAME}`,
  )

  const writeStream = createWriteStream(nodePath, { mode: NODE_MODE })
  body.pipe(writeStream)
  await pEvent(writeStream, 'finish')
}

const NODE_MODE = 0o755

// The Unix Node binary comes in a tar.gz folder
const downloadUnixNode = async function(version, outputDir) {
  const { body } = await fetchUrl(
    `${URL_BASE}/v${version}/node-v${version}-${platform}-${arch}.tar.gz`,
  )

  const archive = body.pipe(createGunzip())
  await unarchive(archive, outputDir)
}

const URL_BASE = 'https://nodejs.org/dist'

const unarchive = async function(archive, outputDir) {
  const extract = tarExtract(outputDir, { ignore: shouldExclude, strip: 2 })
  archive.pipe(extract)
  await pEvent(extract, 'finish')
}

// As a performance optimization, we only unpack the node binary, not the other
// files.
const shouldExclude = function(path) {
  return !path.endsWith(`/${NODE_FILENAME}`)
}

const NODE_FILENAME = platform === 'win32' ? 'node.exe' : 'node'

// Forward arguments to another node binary located at `nodePath`.
// We also forward standard streams and exit code.
const runNodeProcess = async function(nodePath, args) {
  const childProcess = spawn(nodePath, args, { stdio: 'inherit' })
  const [exitCode, signal] = await pEvent(childProcess, 'exit', {
    multiArgs: true,
  })
  return { exitCode, signal }
}

runCli()
