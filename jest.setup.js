// jest.setup.js
// Polyfill globals that Expo SDK 54+ runtime.native.ts installs via lazy getters.
// The lazy getters call require() outside module scope, which Jest blocks.
// We pre-install them so the lazy getters are never triggered.

// structuredClone — already exists in Node 17+, but Expo's getter shadows it.
// By ensuring it exists first, the Expo lazy getter won't fire.
if (typeof globalThis.structuredClone === 'undefined') {
    globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

// __ExpoImportMetaRegistry
if (typeof globalThis.__ExpoImportMetaRegistry === 'undefined') {
    Object.defineProperty(globalThis, '__ExpoImportMetaRegistry', {
        value: { register: () => { }, getModule: () => undefined },
        configurable: true,
        enumerable: false,
        writable: true,
    });
}

// URL / URLSearchParams — typically exist in Node, but ensure they're writable
// so Expo's getter doesn't try to overwrite them.
