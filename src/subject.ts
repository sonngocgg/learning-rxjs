import {
	AsyncSubject,
	BehaviorSubject,
	connectable,
	from,
	interval,
	ReplaySubject,
	share,
	Subject,
	Subscription,
} from 'rxjs'

// ====================
// Subject
// What is a Subject? An RxJS Subject is a special type of Observable that allows values to be multicasted to many Observers. While plain Observables are unicast (each subscribed Observer owns an independent execution of the Observable), Subjects are multicast.
// A Subject is like an Observable, but can multicast to many Observers. Subjects are like EventEmitters: they maintain a registry of many listeners.

// Every Subject is an Observable. Given a Subject, you can subscribe to it, providing an Observer, which will start receiving values normally. From the perspective of the Observer, it cannot tell whether the Observable execution is coming from a plain unicast Observable or a Subject.

// Internally to the Subject, subscribe does not invoke a new execution that delivers values. It simply registers the given Observer in a list of Observers, similarly to how addListener usually works in other libraries and languages.

// Every Subject is an Observer. It is an object with the methods next(v), error(e), and complete(). To feed a new value to the Subject, just call next(theValue), and it will be multicasted to the Observers registered to listen to the Subject.

// In the example below, we have two Observers attached to a Subject, and we feed some values to the Subject:

// const subject = new Subject<number>()

// subject.subscribe({
// 	next: v => console.log(`observerA: ${v}`),
// })

// subject.subscribe({
// 	next: v => console.log(`observerB: ${v}`),
// })

// subject.next(1)
// subject.next(2)

// Since a Subject is an Observer, this also means you may provide a Subject as the argument to the subscribe of any Observable, like the example below shows:

// const subject = new Subject<number>()

// subject.subscribe({
// 	next: v => console.log(`observerA: ${v}`),
// })
// subject.subscribe({
// 	next: v => console.log(`observerB: ${v}`),
// })

// const observable = from([1, 2, 3])
// observable.subscribe(subject)

// With the approach above, we essentially just converted a unicast Observable execution to multicast, through the Subject. This demonstrates how Subjects are the only way of making any Observable execution be shared to multiple Observers.

// There are also a few specializations of the Subject type: BehaviorSubject, ReplaySubject, and AsyncSubject.

// ====================
// Multicasted Observables
// A "multicasted Observable" passes notifications through a Subject which may have many subscribers, whereas a plain "unicast Observable" only sends notifications to a single Observer.

// A multicasted Observable uses a Subject under the hood to make multiple Observers see the same Observable execution.

// Under the hood, this is how the multicast operator works: Observers subscribe to an underlying Subject, and the Subject subscribes to the source Observable. The following example is similar to the previous example which used observable.subscribe(subject):

// const source = from([1, 2, 3])
// const subject = new Subject<number>()
// const multicasted = connectable(source, {
// 	connector: () => subject,
// })

// // These are, under the hood, `subject.subscribe({...})`:
// multicasted.subscribe({
// 	next: v => console.log(`observerA: ${v}`),
// })
// multicasted.subscribe({
// 	next: v => console.log(`observerB: ${v}`),
// })

// // This is, under the hood, `source.subscribe(subject)`:
// multicasted.connect()

// multicast returns an Observable that looks like a normal Observable, but works like a Subject when it comes to subscribing. multicast returns a ConnectableObservable, which is simply an Observable with the connect() method.

// The connect() method is important to determine exactly when the shared Observable execution will start. Because connect() does source.subscribe(subject) under the hood, connect() returns a Subscription, which you can unsubscribe from in order to cancel the shared Observable execution.

// ====================
// Reference counting
// Calling connect() manually and handling the Subscription is often cumbersome. Usually, we want to automatically connect when the first Observer arrives, and automatically cancel the shared execution when the last Observer unsubscribes.

// Consider the following example where subscriptions occur as outlined by this list:

// First Observer subscribes to the multicasted Observable
// The multicasted Observable is connected
// The next value 0 is delivered to the first Observer
// Second Observer subscribes to the multicasted Observable
// The next value 1 is delivered to the first Observer
// The next value 1 is delivered to the second Observer
// First Observer unsubscribes from the multicasted Observable
// The next value 2 is delivered to the second Observer
// Second Observer unsubscribes from the multicasted Observable
// The connection to the multicasted Observable is unsubscribed

// const source = interval(500)
// const subject = new Subject<number>()
// const refCounted = source.pipe(
// 	share({
// 		connector: () => subject,
// 	})
// )

// let subscription1: Subscription, subscription2: Subscription

// // This calls `connect()`, because
// // it is the first subscriber to `refCounted`
// console.log('observerA subscribed')
// subscription1 = refCounted.subscribe({
// 	next: v => console.log(`observerA: ${v}`),
// })

// setTimeout(() => {
// 	console.log('observerB subscribed')
// 	subscription2 = refCounted.subscribe({
// 		next: v => console.log(`observerB: ${v}`),
// 	})
// }, 600)

// setTimeout(() => {
// 	console.log('observerA unsubscribed')
// 	subscription1.unsubscribe()
// }, 1200)

// // This is when the shared Observable execution will stop, because
// // `refCounted` would have no more subscribers after this
// setTimeout(() => {
// 	console.log('observerB unsubscribed')
// 	subscription2.unsubscribe()
// }, 2000)

// ====================
// Behavior Subject
// One of the variants of Subjects is the BehaviorSubject, which has a notion of "the current value". It stores the latest value emitted to its consumers, and whenever a new Observer subscribes, it will immediately receive the "current value" from the BehaviorSubject.

// BehaviorSubjects are useful for representing "values over time". For instance, an event stream of birthdays is a Subject, but the stream of a person's age would be a BehaviorSubject.

// In the following example, the BehaviorSubject is initialized with the value 0 which the first Observer receives when it subscribes. The second Observer receives the value 2 even though it subscribed after the value 2 was sent.

// const subject = new BehaviorSubject(0)
// subject.subscribe({
// 	next: v => console.log(`observerA: ${v}`),
// })

// subject.next(1)
// subject.next(2)

// subject.subscribe({
// 	next: v => console.log(`observerB: ${v}`),
// })

// subject.next(3)

// ====================
// Replay Subject
// A ReplaySubject is similar to a BehaviorSubject in that it can send old values to new subscribers, but it can also record a part of the Observable execution.

// A ReplaySubject records multiple values from the Observable execution and replays them to new subscribers

// When creating a ReplaySubject, you can specify how many values to replay:

// const subject = new ReplaySubject(3) // buffer 3 values for new subscribers

// subject.subscribe({
// 	next: v => console.log(`observerA: ${v}`),
// })

// subject.next(1)
// subject.next(2)
// subject.next(3)
// subject.next(4)

// subject.subscribe({
// 	next: v => console.log(`observerB: ${v}`),
// })

// subject.next(5)

// You can also specify a window time in milliseconds, besides of the buffer size, to determine how old the recorded values can be. In the following example we use a large buffer size of 100, but a window time parameter of just 500 milliseconds.

// const subject = new ReplaySubject(100, 500 /* windowTime */)

// subject.subscribe({
// 	next: v => console.log(`observerA: ${v}`),
// })

// let i = 1
// setInterval(() => subject.next(i++), 200)

// setTimeout(() => {
// 	subject.subscribe({
// 		next: v => console.log(`observerB: ${v}`),
// 	})
// }, 1000)

// ====================
// Async Subject
// The AsyncSubject is a variant where only the last value of the Observable execution is sent to its observers, and only when the execution completes.

// const subject = new AsyncSubject()

// subject.subscribe({
// 	next: v => console.log(`observerA: ${v}`),
// })

// subject.next(1)
// subject.next(2)
// subject.next(3)
// subject.next(4)

// subject.next(5)
// subject.complete()

// subject.subscribe({
// 	next: v => console.log(`observerB: ${v}`),
// })

// The AsyncSubject is similar to the last() operator, in that it waits for the complete notification in order to deliver a single value.

// ====================
// Void subject
// Sometimes the emitted value doesn't matter as much as the fact that a value was emitted.

// For instance, the code below signals that one second has passed.
// const subject = new Subject<string>()
// setTimeout(() => subject.next('dummy'), 1000)

// Passing a dummy value this way is clumsy and can confuse users.

// By declaring a void subject, you signal that the value is irrelevant. Only the event itself matters.

const subject = new Subject<void>()

subject.subscribe({
	next: () => console.log('One second has passed'),
})

setTimeout(() => subject.next(), 1000)
