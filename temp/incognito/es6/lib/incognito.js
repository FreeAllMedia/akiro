let weakMap = new WeakMap();

export default function privateData (object) {
    if (!weakMap.has(object)) {
			weakMap.set(object, {});
		}
    return weakMap.get(object);
}
