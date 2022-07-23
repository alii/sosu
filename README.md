# `sosu`

Sosu is a global state manager for React that tracks keys that are used in your store.

### Usage:

```tsx
import {store} from 'sosu';

const {useStore, useSet} = store({
	age: 0,
	name: 'alistair',
});

function App() {
	// This component will only rerender when age changes,
	// and never name. This is because it is not "tracked"
	// or "used" in our destructure.
	const {age} = useStore();

	return <div>{age}</div>;
}
```

### Wait, what? How does this work

Suso uses proxies and getters to figure out which keys of an object are actually accessed. It then subscribes to listen to those keys only and will rerender your components as necessary.

### Let me read more...

Okay, I hear you. This package was hugely inspired by the wonderful Paco Coursey, who wrote a few words about this exact topic. In fact, a lot of the code here is taken from [this blog post](https://paco.me/writing/hook-getter).
