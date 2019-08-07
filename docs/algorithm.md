This is a work in progress! Those are just text notes for myself at the moment.

This describes:

- some problems encountered when trying to benchmark JavaScript code accurately
  and precisely
- the solutions implemented by this library

## Engine variance

_Problem_: The duration of a function varies due to the JavaScript engine
optimization and background processes.

_Solution_: We use medians instead of arithmetic means to limit this.

## Background processes

_Problem_: Performance greatly slows down at regular intervals due to the
JavaScript engine background processes (such as garbage collection).

_Solution_: We discard measurements that are extremely slow compared to the
others.

## Benchmarking bias

_Problem_: Benchmarking introduces a small performance penalty to the measured
function:

- benchmarking requires retrieving the current timestamp (`60ns` on my machine)
- making the function call itself (even if the function is empty) takes a small
  time (`3ns` on my machine)
- the benchmark loop needs to repeatedly check whether the loop should end
  (`0.3ns` on my machine)

_Solution_: We calculate the bias by benchmarking an empty function then
substracting that bias from the results.

## Benchmarking variations

_Problem_: The benchmarking bias is not constant. Its variation makes the
measurement less precise.

_Solution_: We measure functions in a loop to reduce the impact of the
benchmarking logic variation. This only applies to functions which are so fast
that their duration is close to the benchmarking logic duration. The number of
iterations in the loop is automatically guessed.

## Time resolution

_Problem_: The measured function's duration might be too close to the system's
time resolution to be precisely calculated.

_Solution_: Looping (see above).

## Slow starts

_Problem_: Due to JavaScript engine optimization, the first invocation of most
functions is much slower than later runs. This applies to both:

- the benchmarked function
- the benchmarking logic itself. Which means the first task will run faster than
  the other tasks.

_Solution_: We do a cold start, i.e. run functions once before benchmarking
them.

## Caching

_Problem_: The benchmarked code might perform caching or memoization. This would
make the first invocation much slower than later runs.

_Solution_: If the first invocation is much slower than later runs, we discard
it.

## Speedups

_Problem_: Due to JavaScript engine optimization, the more a function is run,
the faster is gets. Which means longer benchmarks result in faster times.

_Solution_: We limit the maximum number of measurements. When reaching the limit
we start a different child process instead of keeping iterating,

_Additional solution_: The bias calculation provides with a cold start for the
benchmarking logic itself, so it's already fast when the actual benchmark
starts.

## Very fast functions

_Problem_: Functions that are as fast as the iteration itself (e.g. faster than
`1ns`) cannot be measured because their measurement cannot be separated from the
duration of the benchmark iteration logic itself.

_Solution_: We don't have any solution at the moment. Such code will be
benchmarked as taking `0ns`.

_Invalid solution_: We could use loop unrolling such as
`new Function('f', 'f();'.repeat(number))` or
`new Function('', func.toString().repeat(number))`. However this has several
issues:

- such `Function` actually has more variance and is slower than a regular loop
- this requires lots of memory. Because of this the number of iterations cannot
  be high enough to provide with precise results.
- such `Function` are weirdly optimized by JavaScript engines

_Invalid solution_: We could use CPU profiling such as `node --cpu-prof`.
However this has several issues:

- the measurements vary too much due to sampling
- the minimum resolution is `1000ns` which means very fast functions cannot be
  precisely measured
- the results are measured in number of hits instead of number of nanoseconds
- this is V8-specific

## Number of iterations

_Problem_: Many other benchmarking libraries run functions using a fixed number
of iterations. This approach
[has several issues](https://mathiasbynens.be/notes/javascript-benchmarking):

- faster code has higher variance which means:
  - the faster the code or the JavaScript engine gets, the less precise the
    benchmarks become
  - when comparing functions, the faster ones are less precise
- users cannot specify how long they are ready to wait:
  - user experience is bad when functions are unexpectedly slow
  - measurements are imprecise when functions are unexpectedly fast
  - a separate timeout option is required

_Solution_: We use a maximum duration instead of a maximum number of iterations.

## Processes variations

_Problem_: Different processes (e.g. when user is running new benchmarks) have
different performance profiles resulting in variations between runs. This is
because different processes run with slightly faster or slower performance than
others, due to OS variations and JavaScript engine optimizations.

_Solution_: We run several child processes and merge their results. We run them
serially so they don't compete with each other, which would otherwise make
measured times slower and less precise. We use child processes instead of worker
threads because:

- time slicing might happen in the middle of a measurement
- they run in a slightly different environment. For example `process.*` has
  fewer methods.

## Asynchronous code

_Problem_: Async functions require async benchmarking logic. However async
benchmarking logic have some performance penalty due to the duration of
following promises. This makes measuring sync functions with async benchmarking
code problematic.

_Solution_: We use different logic to benchmark sync and async functions.
