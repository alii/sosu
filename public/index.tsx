import {store} from '../src/index.js';
import {createRoot} from 'react-dom/client';

const {useStore, useSet, subscribe, getState, setState} = store({
	age: 17,
	name: 'alistair',
	clock: 0,
});

subscribe(state => {
	console.log('State changed', state);
});

setInterval(() => {
	const {clock} = getState();
	setState('clock', clock + 1);
}, 1000);

let renders = 0;
function Name() {
	const {name} = useStore();

	++renders;

	return (
		<div>
			<h1>Name: {name}</h1>
			<h2>Renders: {renders} (shouldn't change)</h2>
		</div>
	);
}

function Clock() {
	const {clock} = useStore();
	return <>clock: {clock}</>;
}

function Age() {
	const {age} = useStore();
	return <>age: {age}</>;
}

function App() {
	const setAge = useSet('age');

	const up = () => setAge(old => old + 1);
	const down = () => setAge(old => old - 1);

	return (
		<div>
			<Name />
			<Clock />

			<div>
				<Age />
			</div>

			<button onClick={up}>age++</button>
			<button onClick={down}>age--</button>
		</div>
	);
}

createRoot(document.getElementById('root')!).render(<App />);
