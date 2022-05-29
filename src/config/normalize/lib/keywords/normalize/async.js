import { DefinitionError } from '../../error.js'

// When the top mode is sync, async methods in keywords are forbidden.
// When the top mode is async, both sync|async methods in keywords are allowed,
// but async are preferred for performance reasons.
// Keywords can define the same method both sync|async to allow using it in
// sync mode, while still getting performance benefits in async mode.
//  - All builtin keywords work both sync|async
export const normalizeAsyncMethods = function (keyword, sync) {
  return METHOD_NAMES.reduce(
    (keywordA, methodName) => normalizeAsyncMethod(sync, methodName, keywordA),
    keyword,
  )
}

// Keyword methods which can be either sync or async
const METHOD_NAMES = ['test', 'normalize', 'main']

// Normalize `test[Async]()` (and so on) into only `test()` together with a
// `testSync` boolean property
const normalizeAsyncMethod = function (
  sync,
  methodName,
  {
    [methodName]: syncMethod,
    [`${methodName}${ASYNC_SUFFIX}`]: asyncMethod,
    ...keyword
  },
) {
  if (syncMethod === undefined && asyncMethod === undefined) {
    return keyword
  }

  const syncProp = `${methodName}${SYNC_SUFFIX}`
  return sync
    ? requireSyncMethod({ methodName, syncMethod, keyword, syncProp })
    : preferAsyncMethod({
        methodName,
        syncMethod,
        asyncMethod,
        keyword,
        syncProp,
      })
}

const ASYNC_SUFFIX = 'Async'
const SYNC_SUFFIX = 'Sync'

const requireSyncMethod = function ({
  methodName,
  syncMethod,
  keyword,
  syncProp,
}) {
  if (syncMethod === undefined) {
    throw new DefinitionError(
      `The "async: true" option must be used because they keyword "${keyword.name}" is async.`,
    )
  }

  return { ...keyword, [methodName]: syncMethod, [syncProp]: true }
}

const preferAsyncMethod = function ({
  methodName,
  syncMethod,
  asyncMethod,
  keyword,
  syncProp,
}) {
  return asyncMethod === undefined
    ? { ...keyword, [methodName]: syncMethod, [syncProp]: true }
    : { ...keyword, [methodName]: asyncMethod, [syncProp]: false }
}
