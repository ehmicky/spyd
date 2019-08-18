import { getDir } from './dir.js'

// List previous benchmarks
export const list = async function({ data, cwd, store: { list: listStore } }) {
  const dir = await getDir({ data, cwd })

  try {
    const benchmarks = await listStore(dir)
    return benchmarks
  } catch (error) {
    throw new Error(
      `Could not list previous benchmarks from '${dir}':\n${error.message}`,
    )
  }
}
