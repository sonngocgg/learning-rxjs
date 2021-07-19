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
const observable = new Observable<number>(subscriber => {
	subscriber.next(1)
	subscriber.next(2)
	subscriber.next(3)
	setTimeout(() => {
		subscriber.next(4)
		subscriber.complete()
	}, 1000)
})

console.log('just before subscribe')
observable.subscribe({
	next(x) {
		console.log('got value ' + x)
	},
	error(err) {
		console.error('something wrong occurred: ' + err)
	},
	complete() {
		console.log('done')
	},
})
console.log('just after subscribe')
