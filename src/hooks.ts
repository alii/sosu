import {useState} from 'react';

export function useUnstableRerender() {
	const [, rerender] = useState({});

	return () => rerender({});
}
