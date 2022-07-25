import {store} from '../src/index.js';
import {createRoot} from 'react-dom/client';

const {
	useStore,
	useSet,
	subscribe,
	getState,
	setState,
	useValue,
	batchSetState,
} = store({
	age: 17,
	name: 'alistair',
	clock: 0,
	resetClock: () => setState('clock', 0),
	resetAge: () => setState('age', 17),
});

subscribe(state => {
	console.log('State changed', state);
});

function RendersValue() {
	const age = useValue('age');
	return <div>age (via useValue): {age}</div>;
}

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

function ClockWithInternals() {
	const store = useStore();

	return <>clock: {store.clock}</>;
}

function Age() {
	const {age} = useStore();

	return <>age (via useStore): {age}</>;
}

function WithManyUpdates() {
	return (
		<button
			onClick={() => {
				batchSetState({
					age: 20,
					name: 'not alistair',
				});

				batchSetState({
					clock: 10,
				});
			}}
		>
			many updates
		</button>
	);
}

function App() {
	const setAge = useSet('age');
	const store = useStore();

	const up = () => setAge(old => old + 1);
	const down = () => setAge(old => old - 1);
	const reset = () => store.resetAge();

	return (
		<div>
			<Name />
			<ClockWithInternals />
			<RendersValue />
			<WithManyUpdates />

			<div>
				<Age />
			</div>

			<button onClick={up}>age++</button>
			<button onClick={down}>age--</button>
			<button onClick={reset}>reset</button>
		</div>
	);
}

createRoot(document.getElementById('root')!).render(<App />);
