import { describe, expect, it, beforeEach } from 'vitest';
import { saveRecentItem, getRecentItems, removeRecentItem } from '../js/core/storage.js';

function createLocalStorageMock() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

beforeEach(() => {
  globalThis.localStorage = createLocalStorageMock();
});

describe('storage recents', () => {
  it('keeps only latest 5 items per key', () => {
    for (let i = 1; i <= 6; i++) {
      saveRecentItem('salary', { id: String(i), label: `item${i}` }, { max: 5 });
    }
    const items = getRecentItems('salary');
    expect(items.length).toBe(5);
    expect(items[0].id).toBe('6');
    expect(items[4].id).toBe('2');
  });

  it('moves duplicate item to top', () => {
    saveRecentItem('salary', { id: 'a', label: 'A' }, { max: 5, dedupeKey: 'id' });
    saveRecentItem('salary', { id: 'b', label: 'B' }, { max: 5, dedupeKey: 'id' });
    saveRecentItem('salary', { id: 'a', label: 'A2' }, { max: 5, dedupeKey: 'id' });
    const items = getRecentItems('salary');
    expect(items.length).toBe(2);
    expect(items[0].id).toBe('a');
    expect(items[0].label).toBe('A2');
  });

  it('removes item by id', () => {
    saveRecentItem('salary', { id: 'a', label: 'A' }, { max: 5 });
    saveRecentItem('salary', { id: 'b', label: 'B' }, { max: 5 });
    removeRecentItem('salary', (item) => item.id === 'a');
    const items = getRecentItems('salary');
    expect(items.map((x) => x.id)).toEqual(['b']);
  });
});
