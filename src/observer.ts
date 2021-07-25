import { Observable } from 'rxjs'

// ====================
// Observer
// What is an Observer? An Observer is a consumer of values delivered by an Observable.
// Observers are simply a set of callbacks, one for each type of notification delivered by the Observable: next, error, and complete.
// The following is an example of a typical Observer object:

// const observable = new Observable<string | number>(subscriber => {
// 	try {
// 		subscriber.next(1)
// 		subscriber.next('2')
// 		subscriber.complete()
// 	} catch (error) {
// 		subscriber.error(error)
// 	}
// })

// const observer = {
// 	next: (x: string | number) => console.log('Observer got a next value: ' + x),
// 	error: (err: Error) => console.error('Observer got an error: ' + err),
// 	complete: () => console.log('Observer got a complete notification'),
// }

// observable.subscribe(observer)

// Observers in RxJS may also be partial. If you don't provide one of the callbacks,
// the execution of the Observable will still happen normally, except some types of notifications will be ignored,
// because they don't have a corresponding callback in the Observer.

// The example below is an Observer without the complete callback:

// const observer = {
// 	next: (x: string | number) => console.log('Observer got a next value: ' + x),
// 	error: (err: Error) => console.error('Observer got an error: ' + err),
// }

// When subscribing to an Observable, you may also just provide the next callback as an argument,
// without being attached to an Observer object, for instance like this:
// observable.subscribe(x => console.log('Observer got a next value: ' + x))
