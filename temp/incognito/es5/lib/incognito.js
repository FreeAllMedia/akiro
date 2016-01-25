"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = privateData;
var weakMap = new WeakMap();

function privateData(object) {
    if (!weakMap.has(object)) {
        weakMap.set(object, {});
    }
    return weakMap.get(object);
}

module.exports = exports["default"];