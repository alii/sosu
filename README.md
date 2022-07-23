# `sosu`

Sosu is a zero-dependency, ESM-only global state manager for React that tracks keys and intelligently rerenders

[Demo](https://codesandbox.io/s/sosu-demo-oftz7o?file=/src/App.tsx)

### Basic usage:

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

More advanced usage can be found in the [demo](https://codesandbox.io/s/sosu-demo-oftz7o?file=/src/App.tsx)

### Wait, what? How does this work

Sosu uses proxies and getters to figure out which keys of an object are actually accessed. It then subscribes to listen to those keys only and will rerender your components as necessary.

There is a demo in the `public` folder here. It's a simple example that proves that the components are only rerendering when they need to!

### Let me read more...

Okay, I hear you. This package was hugely inspired by the wonderful Paco Coursey, who wrote a few words about this exact topic. In fact, a lot of the code here is taken from [this blog post](https://paco.me/writing/hook-getter).

### Contributing

This repo uses yarn and also [bun](https://bun.sh) to run the dev server. Make sure you have both installed, and run `bun run example` to start the dev server on :3000
