import { concatAll, filter, from, map, Observable, of, pipe } from 'rxjs'

// ====================
// Operator
// RxJS is mostly useful for its operators, even though the Observable is the foundation.
// Operators are the essential pieces that allow complex asynchronous code to be easily composed in a declarative manner.

// ====================
// What are operators
// Operators are functions. There are two kinds of operators:

// ====================
// Pipeable Operators
// Pipeable Operators are the kind that can be piped to Observables using the syntax observableInstance.pipe(operator()).
// These include, filter(...), and mergeMap(...). When called, they do not change the existing Observable instance.
// Instead, they return a new Observable, whose subscription logic is based on the first Observable.

// A Pipeable Operator is essentially a pure function which takes one Observable as input and generates another Observable as output.
// Subscribing to the output Observable will also subscribe to the input Observable.

// Summary: A Pipeable Operator is a function that takes an Observable as its input and returns another Observable.
// It is a pure operation: the previous Observable stays unmodified.

// Piping
// Pipeable operators are functions, so they could be used like ordinary functions: op()(obs)
// But in practice, there tend to be many of them convolved together,
// and quickly become unreadable: op4()(op3()(op2()(op1()(obs)))).
// For that reason, Observables have a method called .pipe() that accomplishes the same thing while being much easier to read:

// obs.pipe(op1(), op2(), op3(), op4())

// As a stylistic matter, op()(obs) is never used, even if there is only one operator; obs.pipe(op()) is universally preferred.

// ====================
// Creation Operators
// Creation Operators are the other kind of operator, which can be called as standalone functions to create a new Observable.
// For example: of(1, 2, 3) creates an observable that will emit 1, 2, and 3, one right after another.

// Creation Operators
// What are creation operators? Distinct from pipeable operators, creation operators are functions that can be used to create an Observable with some common predefined behavior or by joining other Observables.

// A typical example of a creation operator would be the interval function. It takes a number (not an Observable) as input argument, and produces an Observable as output:

// const observable = interval(1000)

// ====================
// Higher-oder Observables
// Observables most commonly emit ordinary values like strings and numbers, but surprisingly often, it is necessary to handle Observables of Observables, so-called higher-order Observables.

// For example, you had an Observable emitting key to get numbers, getNumbers returns an Observable for each key. Now you have an Observable of Observables, a higher-order Observable
// But how do you work with a higher-order Observable? Typically, by flattening: by (somehow) converting a higher-order Observable into an ordinary Observable. For example:

// const numbers: {
// 	[key: string]: number[]
// } = {
// 	0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
// 	1: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
// 	2: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
// }

// const getNumbers = (key: string) => from(numbers[key])

// const observable = from(Object.keys(numbers)).pipe(
// 	map(key => getNumbers(key)),
// 	concatAll()
// )

// observable.subscribe(num => console.log(num))

// The concatAll() operator subscribes to each "inner" Observable that comes out of the "outer" Observable, and copies all the emitted values until that Observable completes, and goes on to the next one. All of the values are in that way concatenated. Other useful flattening operators (called join operators) are
//   mergeAll() — subscribes to each inner Observable as it arrives, then emits each value as it arrives
//   switchAll() — subscribes to the first inner Observable when it arrives, and emits each value as it arrives, but when the next inner Observable arrives, unsubscribes to the previous one, and subscribes to the new one.
//   exhaust() — subscribes to the first inner Observable when it arrives, and emits each value as it arrives, discarding all newly arriving inner Observables until that first one completes, then waits for the next inner Observable.
//   Just as many array libraries combine map() and flat() (or flatten()) into a single flatMap(), there are mapping equivalents of all the RxJS flattening operators concatMap(), mergeMap(), switchMap(), and exhaustMap().

// ====================
// Creating custom operators
// Use the pipe function to make new operators
// If there is a commonly used sequence of operators in your code, use the pipe() function to extract the sequence into a new operator. Even if a sequence is not that common, breaking it out into a single operator can improve readability.

// For example, you could make a function that discarded odd values and doubled even values like this:
// function discardOddDoubleEven() {
// 	return pipe(
// 		filter((v: number) => !(v % 2)),
// 		map(v => v + v)
// 	)
// }

// Note: The pipe function is analogous to, but not the same thing as, the .pipe() method on an Observable.

// Creating new operators from scratch
// It is more complicated, but if you have to write an operator that cannot be made from a combination of existing operators (a rare occurrence), you can write an operator from scratch using the Observable constructor, like this:

function delay<T>(delayInMilliseconds: number) {
	return (observable: Observable<T>) =>
		new Observable<T>(subscriber => {
			// This function will be called each time this Observable is subscribed to
			const allTimerIDs = new Set<NodeJS.Timeout>()
			let hasCompleted = false

			const observer = {
				next(value: T) {
					const timerID = setTimeout(() => {
						subscriber.next(value)
						// after we push the value, we need to clean up the timer timerID
						allTimerIDs.delete(timerID)
						// If the source has completed, and there are no more timers running,
						// we can complete the resulting observable.
						if (hasCompleted && allTimerIDs.size === 0) {
							subscriber.complete()
						}
					}, delayInMilliseconds)

					allTimerIDs.add(timerID)
				},
				error(err: Error) {
					subscriber.error(err)
				},
				complete() {
					hasCompleted = true
					// If we still have timers running, we don't want to yet.
					if (allTimerIDs.size === 0) {
						subscriber.complete()
					}
				},
			}

			const subscription = observable.subscribe(observer)
			// Return the teardown logic. This will be invoked when
			// the result errors, completes, or is unsubscribed.
			return () => {
				subscription.unsubscribe()
				// Clean up our timers.
				for (const timerID of allTimerIDs) {
					clearTimeout(timerID)
				}
			}
		})
}
// Try it out!
of(1, 2, 3).pipe(delay(1000)).subscribe(console.log)

// Note that you must
// implement all three Observer functions, next(), error(), and complete() when subscribing to the input Observable.
// implement a "teardown" function that cleans up when the Observable completes (in this case by unsubscribing and clearing any pending timeouts)
// return that teardown function from the function passed to the Observable constructor.
// Of course, this is only an example; the delay() operator already exists.
