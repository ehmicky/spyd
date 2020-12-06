// Merge measures from last process to the ones from all previous processes.
// The merged `measures` is sorted, but `childMeasures` is not sorted yet.
export const addMeasures = function (measures, childMeasures) {
  sortNumbers(childMeasures)
  mergeSort(measures, childMeasures)
}

// Sort an array of numbers
const sortNumbers = function (array) {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort(compareNumbers)
}

const compareNumbers = function (numA, numB) {
  return numA - numB
}

// Merges two sorted arrays.
// For better performance, the bigger array should be first.
// The first array is directly mutated. The second is not mutated.
// This is faster than just doing `Array.concat()` then `Array.sort()` and has
// a `O(n)` time complexity.
export const mergeSort = function (bigArray, smallArray) {
  if (bigArray.length === 0) {
    appendArray(bigArray, smallArray)
    return
  }

  if (smallArray.length === 0) {
    return
  }

  resizeArray(bigArray, smallArray)
  mergeValues(bigArray, smallArray)
}

// For performance, if `bigArray` is empty, we just copy `smallArray` over.
const appendArray = function (bigArray, smallArray) {
  const smallArrayLength = smallArray.length

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index !== smallArrayLength; index += 1) {
    // eslint-disable-next-line fp/no-mutating-methods
    bigArray.push(smallArray[index])
  }
}

// Resize `bigArray` so it can receive the new elements from `smallArray`.
// Resizing an array is slow, so we do this in the most performant way.
// Any element could be copied. We're only looking to extend the size of
// `bigArray`. We use one of its element to ensure the new array slots have
// the correct type which speeds up memory allocation when re-assigned.
const resizeArray = function (bigArray, smallArray) {
  const lastElement = bigArray[bigArray.length - 1]
  const smallArrayLength = smallArray.length

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index !== smallArrayLength; index += 1) {
    // eslint-disable-next-line fp/no-mutating-methods
    bigArray.push(lastElement)
  }
}

// Copy the minimum value of `bigArray` or `smallArray` to the merged array,
// the repeat until both arrays are merged.
// This function is a hot path, which must be tuned for performance. This is why
// we use imperative code.
/* eslint-disable max-statements, max-depth, no-param-reassign, fp/no-let,
   fp/no-loops, fp/no-mutation */
const mergeValues = function (bigArray, smallArray) {
  let index = bigArray.length - 1
  let smallIndex = smallArray.length - 1
  let bigIndex = index - smallIndex - 1
  let smallValue = smallArray[smallIndex]
  let bigValue = bigArray[bigIndex]

  // Performance optimization: the `smallIndex === 0` check is enough to stop
  // the iteration. We do not need any test to be performed on each iteration.
  while (true) {
    if (bigValue > smallValue) {
      bigArray[index] = bigValue
      bigIndex -= 1
      // Performance optimization: access each value of `bigArray` and
      // `smallArray` only once, by storing them in a local variable.
      bigValue = bigArray[bigIndex]
    } else {
      bigArray[index] = smallValue

      // Performance optimization: only do this check when `smallIndex` changed,
      // not on each iteration
      if (smallIndex === 0) {
        break
      }

      smallIndex -= 1
      smallValue = smallArray[smallIndex]
    }

    index -= 1
  }
}
/* eslint-enable max-statements, max-depth, no-param-reassign, fp/no-let,
   fp/no-loops, fp/no-mutation */
