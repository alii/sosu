import React, {memo} from 'react';
import {store} from '../src/index.js';
import {createRoot} from 'react-dom/client';

const {useStore, useSet} = store({
	age: 0,
	another_value: 0,
	name: 'alistair',
});

let parentRenders = 0;
let childRenders = 0;

const OptimizedChild = memo(function OptimizedChild() {
	const {name} = useStore();

	++childRenders;

	return <pre>{JSON.stringify({renders: childRenders, name}, null, 4)}</pre>;
});

function App() {
	const {age, another_value} = useStore();
	const setName = useSet('name');
	const setAnotherValue = useSet('another_value');
	const setAge = useSet('age');

	++parentRenders;

	console.log('render', parentRenders);

	return (
		<div>
			<OptimizedChild />

			<pre>
				{JSON.stringify({renders: parentRenders, another_value, age}, null, 4)}
			</pre>

			<button
				onClick={() => {
					setAge(age + 1);
				}}
			>
				age++
			</button>

			<button
				onClick={() => {
					setAnotherValue(another_value + 1);
				}}
			>
				another_value++
			</button>

			<button
				onClick={() => {
					setName(Math.random().toString());
				}}
			>
				change name
			</button>
		</div>
	);
}

createRoot(document.getElementById('root')!).render(<App />);
