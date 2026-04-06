/**
 * Recent calculation storage utilities
 * - Uses localStorage by default
 * - Keeps most-recent-first order
 */

function getStorage(storage) {
  if (storage) return storage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson(storage, key, arr) {
  storage.setItem(key, JSON.stringify(arr));
}

function defaultIsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function buildStorageKey(namespace) {
  return `recent:${namespace}`;
}

export function getRecentItems(namespace, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage || !namespace) return [];
  return readJson(storage, buildStorageKey(namespace));
}

export function saveRecentItem(namespace, item, options = {}) {
  // Backward-compatible API:
  // - saveRecentItem(ns, item, 5)
  // - saveRecentItem(ns, item, { max: 5, isEqual, storage })
  const normalizedOptions = typeof options === 'number' ? { max: options } : options;
  const storage = getStorage(normalizedOptions.storage);
  if (!storage || !namespace || !item || typeof item !== 'object') return [];
  const max = Number.isInteger(normalizedOptions.max) && normalizedOptions.max > 0 ? normalizedOptions.max : 5;
  const isEqual =
    normalizedOptions.isEqual ||
    (normalizedOptions.dedupeKey
      ? (a, b) => a?.[normalizedOptions.dedupeKey] === b?.[normalizedOptions.dedupeKey]
      : defaultIsEqual);
  const key = buildStorageKey(namespace);
  const existing = readJson(storage, key);
  const deduped = existing.filter((v) => !isEqual(v, item));
  deduped.unshift(item);
  const next = deduped.slice(0, max);
  writeJson(storage, key, next);
  return next;
}

export function removeRecentItem(namespace, predicate, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage || !namespace || (!predicate && predicate !== 0)) return [];
  const key = buildStorageKey(namespace);
  const existing = readJson(storage, key);
  const next =
    typeof predicate === 'function'
      ? existing.filter((item) => !predicate(item))
      : existing.filter((item) => item?.id !== predicate);
  writeJson(storage, key, next);
  return next;
}

export function clearRecentItems(namespace, options = {}) {
  const storage = getStorage(options.storage);
  if (!storage || !namespace) return;
  storage.removeItem(buildStorageKey(namespace));
}

// Backward-compatible aliases used by calculator modules
export function getRecentCalculatorInputs(calculatorKey, options = {}) {
  return getRecentItems(calculatorKey, options);
}

export function saveCalculatorInput(calculatorKey, inputState, options = {}) {
  return saveRecentItem(calculatorKey, inputState, options);
}

export function removeRecentCalculatorInput(calculatorKey, indexOrPredicate, options = {}) {
  if (typeof indexOrPredicate === 'number') {
    const items = getRecentItems(calculatorKey, options);
    const next = items.filter((_, idx) => idx !== indexOrPredicate);
    const storage = getStorage(options.storage);
    if (!storage || !calculatorKey) return [];
    writeJson(storage, buildStorageKey(calculatorKey), next);
    return next;
  }
  return removeRecentItem(calculatorKey, indexOrPredicate, options);
}

export function clearRecentCalculatorInputs(calculatorKey, options = {}) {
  return clearRecentItems(calculatorKey, options);
}
