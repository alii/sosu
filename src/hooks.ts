import {useCallback, useState} from 'react';

export function useRerender() {
	const [, rerender] = useState({});

	return useCallback(() => rerender({}), []);
}

export function useUnstableRerender() {
	const [, rerender] = useState({});

	return () => rerender({});
}
