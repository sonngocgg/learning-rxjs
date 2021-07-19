// Core concepts
// Observable: represents the idea of an invokable collection of future values or events.
// Observer: is a collection of callbacks that knows how to listen to values delivered by the Observable.
// Subscription: represents the execution of an Observable, is primarily useful for cancelling the execution.
// Operators: are pure functions that enable a functional programming style of dealing with collections with operations like map, filter, concat, reduce, etc.
// Subject: is equivalent to an EventEmitter, and the only way of multicasting a value or event to multiple Observers.
// Schedulers: are centralized dispatchers to control concurrency, allowing us to coordinate when computation happens on e.g. setTimeout or requestAnimationFrame or others.

import './first-example'
