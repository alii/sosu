import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	MutableRefObject,
	startTransition,
} from 'react';
import {useUnstableRerender} from './hooks.js';

export type Listener<T> = (value: T, key: keyof T) => unknown;

export interface SosuInternal<T> {
	targets: MutableRefObject<Partial<Record<keyof T, true>>>;
	rerender: () => void;
	stateRef: MutableRefObject<T>;
	state: T;
}

/**
 * Shape representing a store
 */
export interface Store<T> {
	/**
	 * Creates a subscription to the store that will be called when the store changes
	 * @param listener The listener to call when the store changes
	 */
	subscribe: (listener: Listener<T>) => () => void;

	/**
	 * Sets the state of a key in the store and triggers necessary rerenders
	 * @param key The key to set
	 * @param value The value to set
	 */
	setState: <K extends keyof T>(key: K, value: T[K]) => void;

	getState: {
		/**
		 * Gets the current value of the passed key in the store
		 * @param key The key to get the value of
		 */
		<Key extends keyof T>(key: Key): T[Key];

		/**
		 * Gets the current state of the store
		 */
		(): T;
	};

	/**
	 * Allows setting multiple states at once.
	 * Requires React >=18 for transition APIs
	 * @param updates Partial of state
	 */
	batchSetState: (updates: Partial<T>) => void;

	/**
	 * Gets the value of the passed key in the store. This hook will trigger a rerender if the value changes
	 * @param key The key to get the value of
	 */
	useValue<K extends keyof T>(key: K): T[K];

	/**
	 * Creates a function that allows you to dispatch new state for a specific key. Will trigger rerenders.
	 * This function is the same API as `setState` (as in `React.useState()[1]`)
	 * @param key The key to set the value of
	 *
	 * @example
	 * function Controls() {
	 *  	const set = useSet('count');
	 *
	 * 		return (
	 * 			<>
	 * 				<button onClick={() => set(count => count + 1)}>Increment</button>
	 * 				<button onClick={() => set(count => count - 1)}>Decrement</button>
	 * 				<button onClick={() => set(0)}>Reset</button>
	 * 			</>
	 * 		);
	 * }
	 */
	useSet<K extends keyof T>(key: K): Dispatch<SetStateAction<T[K]>>;

	/**
	 * Allows you to listen to any piece of state in the store, intelligently tracking accessed keys.
	 *
	 * Will trigger a rerender if an accessed key's value changes
	 */
	useStore(): T;
}

export function useInternals<T>(
	s: Store<T> | Store<T>['useStore'],
): SosuInternal<T> {
	return (
		(s instanceof Function ? s() : s.useStore()) as unknown as {
			_sosu_internal: SosuInternal<T>;
		}
	)._sosu_internal;
}

export function store<T extends Record<string, unknown>>(initial: T): Store<T> {
	const state = initial;

	const listeners = new Set<Listener<T>>();

	function subscribe(listener: Listener<T>) {
		listeners.add(listener);

		return () => {
			listeners.delete(listener);
		};
	}

	function setState<K extends keyof T>(key: K, value: T[K]) {
		if (!Object.is(state[key], value)) {
			state[key] = value;
			listeners.forEach(listener => listener(state, key));
		}
	}

	function batchSetState(updates: Partial<T>) {
		startTransition(() => {
			for (const [key, value] of Object.entries(updates)) {
				setState(key, value);
			}
		});
	}

	function getState<Key extends keyof T>(key: Key): T[Key];
	function getState(): T;
	function getState(key?: keyof T) {
		if (key) {
			return state[key];
		}

		return state;
	}

	return {
		subscribe,
		setState,
		getState,
		batchSetState,

		useValue<K extends keyof T>(key: K) {
			const [value, setValue] = useState(state[key]);

			useEffect(() => {
				return subscribe((state, updatedKey) => {
					if (updatedKey === key) {
						setValue(state[key]);
					}
				});
			}, [key]);

			return value;
		},

		useSet<K extends keyof T>(key: K) {
			const fn: Dispatch<SetStateAction<T[K]>> = value => {
				const resolved = value instanceof Function ? value(state[key]) : value;

				setState(key, resolved);
			};

			return useCallback(fn, [key]);
		},

		useStore() {
			const targets = useRef<Partial<Record<keyof T, true>>>({});
			const rerender = useUnstableRerender();
			const stateRef = useRef(state);

			const proxy = useMemo(() => {
				stateRef.current = state;

				return new Proxy<T>({} as T, {
					get(_, property) {
						if (property === '_sosu_internal') {
							const internal: SosuInternal<T> = {
								targets,
								rerender,
								stateRef,
								state,
							};

							return internal;
						}

						targets.current[property as keyof T] = true;
						return stateRef.current[property as keyof T];
					},
					set(_, property, value) {
						setState(property as keyof T, value);
						return true;
					},
				});
			}, []);

			useEffect(() => {
				return subscribe((_, key) => {
					if (targets.current[key]) {
						rerender();
					}
				});
			}, []);

			return proxy;
		},
	};
}
