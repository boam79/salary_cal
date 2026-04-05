import { describe, expect, it } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { createApp } from '../server/app.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'salary-cal-lotto-'));
}

describe('lotto backend API (contract)', () => {
  it('GET /health returns ok with flags', async () => {
    const dataDir = makeTmpDir();
    const app = createApp({ dataDir, adminKey: '' });

    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.time).toBe('number');
    expect(typeof res.body.stats).toBe('boolean');
    expect(typeof res.body.history).toBe('boolean');
  });

  it('GET /lotto/stats returns expected fields and types', async () => {
    const dataDir = makeTmpDir();
    const app = createApp({ dataDir, adminKey: '' });

    const res = await request(app).get('/lotto/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.version).toBe('number');
    expect(typeof res.body.updatedAt).toBe('string');
    expect(Array.isArray(res.body.topCombos)).toBe(true);
    expect(Array.isArray(res.body.numberFreq)).toBe(true);
    expect(res.body.numberFreq.length).toBeGreaterThanOrEqual(46);
    expect(typeof res.body.meta).toBe('string');
  });

  it('GET /lotto/generate returns 10 unique sets of 6 numbers (1..45)', async () => {
    const dataDir = makeTmpDir();
    const app = createApp({ dataDir, adminKey: '' });

    const res = await request(app).get('/lotto/generate');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.generated)).toBe(true);
    expect(res.body.count).toBe(res.body.generated.length);
    expect(res.body.count).toBe(10);

    const keys = new Set();
    for (const set of res.body.generated) {
      expect(Array.isArray(set)).toBe(true);
      expect(set.length).toBe(6);
      const sorted = [...set].sort((a, b) => a - b);
      for (const n of sorted) {
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(45);
      }
      const key = sorted.join('-');
      expect(keys.has(key)).toBe(false);
      keys.add(key);
    }
  });
});

