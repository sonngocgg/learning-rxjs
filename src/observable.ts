import { Observable } from 'rxjs'

// ====================
// Observable
// Observables are lazy Push collections of multiple values. They fill the missing spot in the following table
//           Single         Multiple
// Pull    	 Function       Iterator
// Push      Promise        Observable

// ====================
// What is Pull? In Pull systems, the Consumer determines when it receives data from the data Producer.
// The Producer itself is unaware of when the data will be delivered to the Consumer.
// What is Push? In Push systems, the Producer determines when to send data to the Consumer.
// The Consumer is unaware of when it will receive that data.
//            Producer                                   Consumer
// Pull			  Passive: produces data when requested      Active: decides when data is requested
// Push 		  Active: produces data at its own pace      Passive: reacts to received data

// Example: The following is an Observable that pushes the values 1,2,3 immediately (synchronous) when subscribed,
// and the value 4 after one second has passed since the subscribe call, then completes
// const observable = new Observable<number>(subscriber => {
// 	subscriber.next(1)
// 	subscriber.next(2)
// 	subscriber.next(3)
// 	setTimeout(() => {
// 		subscriber.next(4)
// 		subscriber.complete()
// 	}, 1000)
// })

// console.log('just before subscribe')
// observable.subscribe({
// 	next(x) {
// 		console.log('got value ' + x)
// 	},
// 	error(err) {
// 		console.error('something wrong occurred: ' + err)
// 	},
// 	complete() {
// 		console.log('done')
// 	},
// })
// console.log('just after subscribe')

// ====================
// Observables as generalizations of functions
// Contrary to popular claims, Observables are not like EventEmitters nor are they like Promises for multiple values.
// Observables may act like EventEmitters in some cases, namely when they are multicasted using RxJS Subjects, but usually they don't act like EventEmitters.
// Observables are like functions with zero arguments, but generalize those to allow multiple values.

// Example:
// function foo() {
// 	console.log('Hello')
// 	return 42
// }

// const x = foo()
// console.log(x)
// const y = foo()
// console.log(y)

// With RxJS:
// const foo = new Observable(subscriber => {
// 	console.log('Hello')
// 	subscriber.next(42)
// })

// foo.subscribe(x => {
// 	console.log(x)
// })
// foo.subscribe(y => {
// 	console.log(y)
// })

// This happens because both functions and Observables are lazy computations.
// If you don't call the function, the console.log('Hello') won't happen.
// Also with Observables, if you don't "call" it (with subscribe), the console.log('Hello') won't happen.
// Plus, "calling" or "subscribing" is an isolated operation: two function calls trigger two separate side effects,
// and two Observable subscribes trigger two separate side effects.
// As opposed to EventEmitters which share the side effects and have eager execution regardless of the existence of subscribers,
// Observables have no shared execution and are lazy.

// ====================
// Anatomy of an Observable
// Observables are created using new Observable or a creation operator,
// are subscribed to with an Observer, execute to deliver next / error / complete notifications to the Observer,
// and their execution may be disposed. These four aspects are all encoded in an Observable instance,
// but some of these aspects are related to other types, like Observer and Subscription.

// Core Observable concerns:
// 	 Creating Observables
//   Subscribing to Observables
//   Executing the Observable
//   Disposing Observables

// ====================
// Creating Observables

// The Observable constructor takes one argument: the subscribe function.
// The following example creates an Observable to emit the string 'hi' every second to a subscriber.
// const observable = new Observable<string>(function subscribe(subscriber) {
// 	const id = setInterval(() => {
// 		subscriber.next('hi')
// 	}, 1000)
// })

// ====================
// Subscribing to Observables
// The Observable observable in the example can be subscribed to, like this:

// observable.subscribe(x => console.log(x))

// It is not a coincidence that observable.subscribe and subscribe in new Observable(function subscribe(subscriber) {...}) have the same name.
// In the library, they are different, but for practical purposes you can consider them conceptually equal.

// This shows how subscribe calls are not shared among multiple Observers of the same Observable.
// When calling observable.subscribe with an Observer,
// the function subscribe in new Observable(function subscribe(subscriber) {...}) is run for that given subscriber.
// Each call to observable.subscribe triggers its own independent setup for that given subscriber.

// ====================
// Executing the Observable
// The code inside new Observable(function subscribe(subscriber) {...}) represents an "Observable execution",
// a lazy computation that only happens for each Observer that subscribes.
// The execution produces multiple values over time, either synchronously or asynchronously.
// There are three types of values an Observable Execution can deliver:
//  "Next" notification: sends a value such as a Number, a String, an Object, etc.
//  "Error" notification: sends a JavaScript Error or exception.
//  "Complete" notification: does not send a value.

// "Next" notifications are the most important and most common type: they represent actual data being delivered to a subscriber.
// "Error" and "Complete" notifications may happen only once during the Observable Execution, and there can only be either one of them.

// const observable = new Observable(function subscribe(subscriber) {
// 	try {
// 		subscriber.next(1)
// 		subscriber.next(2)
// 		subscriber.next(3)
// 		subscriber.complete()
// 	} catch (err) {
// 		subscriber.error(err) // delivers an error if it caught one
// 	}
// })

// ====================
// Disposing Observable Executions

// Because Observable Executions may be infinite, and it's common for an Observer to want to abort execution in finite time,
// we need an API for canceling an execution. Since each execution is exclusive to one Observer only,
// once the Observer is done receiving values, it has to have a way to stop the execution,
// in order to avoid wasting computation power or memory resources.

// When observable.subscribe is called, the Observer gets attached to the newly created Observable execution.
// This call also returns an object, the Subscription:

// const subscription = observable.subscribe(x => console.log(x))

// The Subscription represents the ongoing execution, and has a minimal API which allows you to cancel that execution.
// With subscription.unsubscribe() you can cancel the ongoing execution:
// subscription.unsubscribe()

// Each Observable must define how to dispose resources of that execution when we create the Observable using create().
// You can do that by returning a custom unsubscribe function from within function subscribe().
// For instance, this is how we clear an interval execution set with setInterval:

// const observable = new Observable(function subscribe(subscriber) {
// 	// Keep track of the interval resource
// 	const intervalId = setInterval(() => {
// 		subscriber.next('hi')
// 	}, 1000)

// 	// Provide a way of canceling and disposing the interval resource
// 	return function unsubscribe() {
// 		clearInterval(intervalId)
// 	}
// })
