import { fromEvent, map, scan, throttleTime } from 'rxjs'

// Normal event listener register
// document.addEventListener('click', () => console.log("Clicked!"))

// Using RxJS to create an observable instead
// fromEvent(document, 'click').subscribe(() => console.log("Clicked!"))

// Purity
// What makes RxJS powerful is its ability to produce values with pure functions
// Normally you would create an impure function, where other pieces of your code can mess up your state
// let count = 0
// document.addEventListener('click', () =>
// 	console.log(`Clicked ${++count} times`)
// )

// Using RxJS you isolate the state
// fromEvent(document, 'click')
// 	.pipe(scan(count => count + 1, 0))
// 	.subscribe(count => console.log(`Clicked ${count} times`))

// Flow
// RxJS has a whole range of operators that helps you control how the events flow through your observables
// This is how you would allow at most one click per second, with plain JavaScript
// let count = 0
// let rate = 1000
// let lastClick = Date.now() - rate
// document.addEventListener('click', () => {
// 	if (Date.now() - lastClick >= rate) {
// 		console.log(`Clicked ${++count} times`)
// 		lastClick = Date.now()
// 	}
// })

// With RxJS
// fromEvent(document, 'click')
// 	.pipe(
// 		throttleTime(1000),
// 		scan(count => count + 1, 0)
// 	)
// 	.subscribe(count => console.log(`Clicked ${count} times`))

// Values
// You can transform the values passed through your observables
// Here is how you can add the current mouse x position for every click, in plain JavaScript
// let count = 0
// const rate = 1000
// let lastClick = Date.now() - rate
// document.addEventListener('click', event => {
// 	if (Date.now() - lastClick >= rate) {
// 		count += event.clientX
// 		console.log(count)
// 		lastClick = Date.now()
// 	}
// })

// With RxJS
fromEvent<MouseEvent>(document, 'click')
	.pipe(
		throttleTime(1000),
		map(event => event.clientX),
		scan((count, clientX) => count + clientX, 0)
	)
	.subscribe(count => console.log(count))
