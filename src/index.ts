import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import {useUnstableRerender} from './hooks.js';

export const ALL_KEYS = '*';
export type Listener<T> = (value: T, key: keyof T | typeof ALL_KEYS) => unknown;

export function store<T extends Record<string, unknown>>(initial: T) {
	let state = {...initial};

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

	return {
		useSet<K extends keyof T>(key: K) {
			const fn: Dispatch<SetStateAction<T[K]>> = value => {
				const resolved = value instanceof Function ? value(state[key]) : value;

				setState(key, resolved);
			};

			return useCallback(fn, [key]);
		},

		useStore() {
			const targets = useRef<Partial<Record<keyof T, boolean>>>({});
			const rerender = useUnstableRerender();
			const stateRef = useRef(state);

			const proxy = useMemo(() => {
				stateRef.current = state;

				return new Proxy<{}>(
					{},
					{
						get(_, property) {
							targets.current[property as keyof T] = true;
							return stateRef.current[property as keyof T];
						},
						set(_, property, value) {
							setState(property as keyof T, value);
							return true;
						},
					},
				);
			}, []) as T;

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
