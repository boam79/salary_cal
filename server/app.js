import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

function buildComboKey(nums) {
  return [...nums].sort((a, b) => a - b).join('-');
}

function createDefaultPaths({ dataDir }) {
  return {
    dataDir,
    historyPath: path.join(dataDir, 'lotto-history.json'),
    statsPath: path.join(dataDir, 'lotto-stats.json'),
    initialDataPath: path.join(dataDir, 'lotto-history-initial.json'),
  };
}

export function createLottoApp({
  adminKey = process.env.ADMIN_KEY || '',
  corsOrigins = ['https://salary-cal.vercel.app', 'http://localhost:3000'],
  paths,
  logger = morgan('dev'),
} = {}) {
  const app = express();

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const resolvedPaths =
    paths ||
    createDefaultPaths({
      dataDir: path.join(__dirname, 'data'),
    });

  function ensureDataDir() {
    if (!fs.existsSync(resolvedPaths.dataDir)) fs.mkdirSync(resolvedPaths.dataDir, { recursive: true });

    if (!fs.existsSync(resolvedPaths.historyPath)) {
      if (fs.existsSync(resolvedPaths.initialDataPath)) {
        const initialData = fs.readFileSync(resolvedPaths.initialDataPath, 'utf8');
        fs.writeFileSync(resolvedPaths.historyPath, initialData);
        console.log('[init] Loaded initial data from lotto-history-initial.json');
      } else {
        fs.writeFileSync(resolvedPaths.historyPath, '[]');
      }
    }

    if (!fs.existsSync(resolvedPaths.statsPath)) {
      fs.writeFileSync(
        resolvedPaths.statsPath,
        JSON.stringify({
          version: 1,
          updatedAt: new Date().toISOString(),
          topCombos: [],
          numberFreq: Array(46).fill(0),
          meta: 'empty',
        }),
      );
    }
  }

  function calculateStats() {
    const raw = fs.readFileSync(resolvedPaths.historyPath, 'utf8');
    const history = JSON.parse(raw);
    const freq = new Map();
    const numberFreq = Array(46).fill(0);
    for (const row of history) {
      if (!row || !Array.isArray(row.numbers) || row.numbers.length !== 6) continue;
      const key = buildComboKey(row.numbers);
      freq.set(key, (freq.get(key) || 0) + 1);
      for (const n of row.numbers) {
        if (Number.isInteger(n) && n >= 1 && n <= 45) numberFreq[n]++;
      }
    }
    const topCombos = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([k]) => k);
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      topCombos,
      numberFreq,
      meta: `total=${history.length}`,
    };
    fs.writeFileSync(resolvedPaths.statsPath, JSON.stringify(payload));
    return payload;
  }

  async function fetchRound(round) {
    const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.dhlottery.co.kr/common.do?method=main',
        Origin: 'https://www.dhlottery.co.kr',
      },
    });
    if (!res.ok) return null;
    const j = await res.json();
    if (!j || j.returnValue !== 'success') return null;
    const numbers = [j.drwtNo1, j.drwtNo2, j.drwtNo3, j.drwtNo4, j.drwtNo5, j.drwtNo6]
      .map((n) => parseInt(n, 10))
      .filter(Boolean);
    if (numbers.length !== 6) return null;
    return { round: j.drwNo, date: j.drwNoDate, numbers };
  }

  async function fetchRoundHtml(round) {
    const url = round
      ? `https://www.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${round}`
      : `https://www.dhlottery.co.kr/gameResult.do?method=byWin`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.dhlottery.co.kr/common.do?method=main',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html, { decodeEntities: true });
    let parsedRound = round;
    const inputVal = $('input[name="drwNo"]').val();
    if ((!parsedRound || parsedRound === 0) && inputVal) parsedRound = parseInt(inputVal, 10);
    const titleText = $('div.win_result h4 strong').text() || $('h4').text() || $('title').text();
    const m = titleText.match(/([0-9]{3,5})\s*회/);
    if ((!parsedRound || parsedRound === 0) && m) parsedRound = parseInt(m[1], 10);

    if (!parsedRound || parsedRound === 0) {
      const inputEl = $('input[name="drwNo"]')[0];
      if (inputEl && inputEl.attribs && inputEl.attribs.value) {
        const v = parseInt(inputEl.attribs.value, 10);
        if (!Number.isNaN(v)) parsedRound = v;
      }
    }

    let nums = [];
    $('span.ball_645, .win_result .num .ball, .lotto_win_number .ball').each((_, el) => {
      const t = $(el).text().trim();
      const n = parseInt(t, 10);
      if (!Number.isNaN(n)) nums.push(n);
    });
    if (nums.length < 6) {
      const texts = $('body').text();
      const all = (texts.match(/\b([1-9]|[1-3][0-9]|4[0-5])\b/g) || []).map((s) => parseInt(s, 10));
      nums = all.slice(0, 6);
    }
    nums = nums.slice(0, 6);
    if (!parsedRound || nums.length !== 6) return null;
    return { round: parsedRound, date: '', numbers: nums };
  }

  async function fetchLatestRoundHtml() {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((today - yearStart) / (1000 * 60 * 60 * 24));
    const estimatedRound = 1000 + Math.floor(daysSinceStart / 3.5);

    for (let tryRound = 1200; tryRound >= Math.max(1, estimatedRound - 50) && tryRound >= 1150; tryRound--) {
      const item = await fetchRound(tryRound);
      if (item) {
        console.log(`[fetchLatest] Found latest round: ${tryRound}`);
        return tryRound;
      }
      await new Promise((res) => setTimeout(res, 50));
    }

    console.warn('[fetchLatest] Could not determine latest round, using fallback');
    return estimatedRound;
  }

  function readHistory() {
    try {
      const raw = fs.readFileSync(resolvedPaths.historyPath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function writeHistory(history) {
    fs.writeFileSync(resolvedPaths.historyPath, JSON.stringify(history));
  }

  async function syncHistory() {
    ensureDataDir();
    let history = readHistory();
    const seen = new Set(history.map((h) => h.round));
    let maxRound = 0;
    history.forEach((h) => {
      if (h.round > maxRound) maxRound = h.round;
    });
    let added = 0;
    const latest = await fetchLatestRoundHtml();
    console.log(`[sync] maxRound=${maxRound}, latest=${latest}`);
    if (latest && latest > maxRound) {
      for (let r = latest; r > maxRound; r--) {
        let item = await fetchRound(r);
        if (!item) item = await fetchRoundHtml(r);
        if (item && !seen.has(item.round)) {
          history.push(item);
          seen.add(item.round);
          added++;
        }
        if (added > 1000) break;
        await new Promise((res) => setTimeout(res, 300 + Math.random() * 300));
      }
    }
    if (added > 0) {
      history.sort((a, b) => a.round - b.round);
      writeHistory(history);
    }
    const stats = calculateStats();
    return { added, stats };
  }

  function weightedPickOne(weight) {
    const sum = weight.reduce((a, b) => a + b, 0);
    if (sum <= 0) return null;
    let r = Math.random() * sum;
    for (let i = 1; i < weight.length; i++) {
      r -= weight[i];
      if (r <= 0) return i;
    }
    return 45;
  }

  function generateUniqueSet(numberFreq, existingComboKeys) {
    const base = numberFreq.slice();
    for (let i = 1; i <= 45; i++) base[i] = Math.max(1, base[i] || 1);
    const chosen = new Set();
    let guard = 0;
    while (chosen.size < 6 && guard < 200) {
      const w = base.slice().map((v, idx) => (idx === 0 ? 0 : v + Math.random() * 0.5));
      for (const n of chosen) w[n] = 0;
      const pick = weightedPickOne(w);
      if (pick && pick >= 1 && pick <= 45) chosen.add(pick);
      guard++;
    }
    const arr = Array.from(chosen).sort((a, b) => a - b);
    const key = buildComboKey(arr);
    if (arr.length !== 6 || existingComboKeys.has(key)) return null;
    return arr;
  }

  function generateUniformUniqueSet(existingComboKeys) {
    const chosen = new Set();
    while (chosen.size < 6) {
      const n = 1 + Math.floor(Math.random() * 45);
      chosen.add(n);
    }
    const arr = Array.from(chosen).sort((a, b) => a - b);
    const key = buildComboKey(arr);
    if (existingComboKeys.has(key)) return null;
    return arr;
  }

  const corsOptions = {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-ADMIN-KEY'],
    credentials: false,
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(express.json({ limit: '256kb' }));

  /** Simple in-memory rate limit (per process). Good enough for small APIs. */
  const rateBuckets = new Map();
  function allowRate(key, windowMs, max) {
    const now = Date.now();
    let b = rateBuckets.get(key);
    if (!b || now > b.resetAt) {
      b = { count: 0, resetAt: now + windowMs };
      rateBuckets.set(key, b);
    }
    b.count += 1;
    return b.count <= max;
  }

  function rateLimit({ name, windowMs, max }) {
    return (req, res, next) => {
      const ip = req.ip || req.socket?.remoteAddress || 'unknown';
      const key = `${name}:${ip}`;
      if (!allowRate(key, windowMs, max)) {
        res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
        return res.status(429).json({ error: 'rate_limit' });
      }
      next();
    };
  }

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    const xfProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    if (req.secure || xfProto === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    next();
  });

  if (logger) app.use(logger);

  app.get('/lotto/stats', (req, res) => {
    try {
      ensureDataDir();
      let payload = JSON.parse(fs.readFileSync(resolvedPaths.statsPath, 'utf8'));
      // 구버전/빈 파일 호환: numberFreq가 없으면 즉시 재계산하여 contract 보장
      const hasNumberFreq = Array.isArray(payload?.numberFreq) && payload.numberFreq.length >= 46;
      if (!hasNumberFreq) {
        payload = calculateStats();
      }
      if (!payload.topCombos || payload.topCombos.length === 0) {
        console.warn('[lotto-backend] stats empty. run /lotto/sync to populate');
      }
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
      res.json(payload);
    } catch (e) {
      console.error('[lotto-backend] stats error', e);
      res.status(500).json({ error: 'stats_error' });
    }
  });

  app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, service: 'lotto-backend', time: Date.now() });
  });

  app.get('/health', (req, res) => {
    try {
      ensureDataDir();
      const stat = fs.existsSync(resolvedPaths.statsPath);
      const hist = fs.existsSync(resolvedPaths.historyPath);
      res.setHeader('Cache-Control', 'no-store');
      res.json({ ok: true, stats: stat, history: hist, time: Date.now() });
    } catch {
      res.status(500).json({ ok: false });
    }
  });

  app.post(
    '/lotto/sync',
    rateLimit({ name: 'lotto_sync', windowMs: 60 * 60 * 1000, max: 20 }),
    (req, res) => {
    (async () => {
      if (adminKey && req.header('X-ADMIN-KEY') !== adminKey) {
        return res.status(401).json({ error: 'unauthorized' });
      }
      try {
        const result = await syncHistory();
        console.log('[lotto-backend] sync completed added=', result.added, 'topCombos=', result.stats.topCombos.length);
        res.json({ ok: true, added: result.added, updatedAt: result.stats.updatedAt });
      } catch (e) {
        console.error('[lotto-backend] sync error', e);
        res.status(500).json({ error: 'sync_error' });
      }
    })();
  });

  app.get(
    '/lotto/generate',
    rateLimit({ name: 'lotto_generate', windowMs: 60 * 1000, max: 120 }),
    (req, res) => {
    try {
      ensureDataDir();
      const stats = JSON.parse(fs.readFileSync(resolvedPaths.statsPath, 'utf8'));
      const history = JSON.parse(fs.readFileSync(resolvedPaths.historyPath, 'utf8'));
      const existing = new Set(history.map((h) => buildComboKey(h.numbers)));

      let numberFreq = Array.isArray(stats.numberFreq) && stats.numberFreq.length >= 46 ? stats.numberFreq : null;
      if (!numberFreq) {
        const freq = Array(46).fill(0);
        if (Array.isArray(history) && history.length) {
          for (const row of history) {
            if (!row || !Array.isArray(row.numbers)) continue;
            for (const n of row.numbers) {
              if (Number.isInteger(n) && n >= 1 && n <= 45) freq[n]++;
            }
          }
        }
        const sum = freq.reduce((a, b) => a + b, 0);
        if (sum === 0) {
          for (let i = 1; i <= 45; i++) freq[i] = 1;
        }
        numberFreq = freq;
      }

      const result = [];
      let tries = 0;
      const forceUniform = String(req.query.uniform || '').trim() === '1';
      while (!forceUniform && result.length < 10 && tries < 2000) {
        const set = generateUniqueSet(numberFreq || [], existing);
        if (set) {
          result.push(set);
          existing.add(buildComboKey(set));
        }
        tries++;
      }
      let tries2 = 0;
      while (result.length < 10 && tries2 < 2000) {
        const set = generateUniformUniqueSet(existing);
        if (set) {
          result.push(set);
          existing.add(buildComboKey(set));
        }
        tries2++;
      }
      if (result.length === 0) {
        for (let k = 0; k < 10; k++) {
          const s = generateUniformUniqueSet(new Set());
          if (s) result.push(s);
        }
      }
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.json({
        generated: result,
        count: result.length,
        updatedAt: stats.updatedAt,
        total: history.length,
        seed: Date.now(),
        strategy: forceUniform ? 'uniform_forced' : 'weighted+uniform_fallback',
      });
    } catch (e) {
      console.error('[lotto-backend] generate error', e);
      res.status(500).json({ error: 'generate_error' });
    }
  });

  // Expose for tests
  app.locals.__paths = resolvedPaths;
  app.locals.__ensureDataDir = ensureDataDir;
  app.locals.__calculateStats = calculateStats;

  return app;
}

// Backward-compatible alias for tests/consumers.
export const createApp = createLottoApp;

