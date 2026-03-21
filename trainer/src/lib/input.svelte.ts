export type Callback = () => void;

let pressHandlers: Callback[] = [];
let releaseHandlers: Callback[] = [];
let isPressed = $state(false);

export function onMorsePress(cb: Callback) {
	pressHandlers.push(cb);
	return () => {
		pressHandlers = pressHandlers.filter((h) => h !== cb);
	};
}

export function onMorseRelease(cb: Callback) {
	releaseHandlers.push(cb);
	return () => {
		releaseHandlers = releaseHandlers.filter((h) => h !== cb);
	};
}

export function getIsPressed() {
	return isPressed;
}

export function triggerPress(e?: Event) {
	if (e && e.cancelable) e.preventDefault();
	if (!isPressed) {
		isPressed = true;
		pressHandlers.forEach((cb) => cb());
	}
}

export function triggerRelease(e?: Event) {
	if (e && e.cancelable) e.preventDefault();
	if (isPressed) {
		isPressed = false;
		releaseHandlers.forEach((cb) => cb());
	}
}

export function handleKeyDown(e: KeyboardEvent) {
	if (e.repeat) return;
	if (e.code === 'Space') {
		triggerPress(e);
	}
}

export function handleKeyUp(e: KeyboardEvent) {
	if (e.code === 'Space') {
		triggerRelease(e);
	}
}
