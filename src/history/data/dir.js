import { hasHistoryDir, ensureHistoryDir, checkHistoryDir } from './fs.js'

// Retrieve the history directory, for a read operation
export const getReadHistoryDir = async (cwd) => {
  const historyDir = getHistoryDir(cwd)

  if (!(await hasHistoryDir(historyDir))) {
    return
  }

  await checkHistoryDir(historyDir)
  return historyDir
}

// Retrieve the history directory, for a write operation
export const getWriteHistoryDir = async (cwd) => {
  const historyDir = getHistoryDir(cwd)
  await ensureHistoryDir(historyDir)
  await checkHistoryDir(historyDir)
  return historyDir
}

const getHistoryDir = (cwd) => `${cwd}/${HISTORY_DIR}`

// At the moment, the history location is hardcoded
const HISTORY_DIR = 'benchmark/history'
