import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 8080;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const corsOptions = {
  origin: ['https://salary-cal.vercel.app', 'http://localhost:3000'],
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','X-ADMIN-KEY'],
  credentials: false
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

const dataDir = path.join(__dirname, 'data');
const historyPath = path.join(dataDir, 'lotto-history.json');
const statsPath = path.join(dataDir, 'lotto-stats.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(historyPath)) fs.writeFileSync(historyPath, '[]');
  if (!fs.existsSync(statsPath)) fs.writeFileSync(statsPath, JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), topCombos: [], meta: 'empty' }));
}

function buildComboKey(nums) {
  return [...nums].sort((a,b)=>a-b).join('-');
}

function calculateStats() {
  const raw = fs.readFileSync(historyPath, 'utf8');
  const history = JSON.parse(raw);
  const freq = new Map();
  for (const row of history) {
    if (!row || !Array.isArray(row.numbers) || row.numbers.length !== 6) continue;
    const key = buildComboKey(row.numbers);
    freq.set(key, (freq.get(key) || 0) + 1);
  }
  const topCombos = Array.from(freq.entries()).sort((a,b)=>b[1]-a[1]).slice(0, 50).map(([k])=>k);
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    topCombos,
    meta: `total=${history.length}`
  };
  fs.writeFileSync(statsPath, JSON.stringify(payload));
  return payload;
}

async function fetchRound(round) {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.dhlottery.co.kr/common.do?method=main',
      'Origin': 'https://www.dhlottery.co.kr'
    }
  });
  if (!res.ok) return null;
  const j = await res.json();
  if (!j || j.returnValue !== 'success') return null;
  const numbers = [j.drwtNo1, j.drwtNo2, j.drwtNo3, j.drwtNo4, j.drwtNo5, j.drwtNo6].map(n=>parseInt(n,10)).filter(Boolean);
  if (numbers.length !== 6) return null;
  return { round: j.drwNo, date: j.drwNoDate, numbers };
}

function readHistory() {
  try {
    const raw = fs.readFileSync(historyPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeHistory(history) {
  fs.writeFileSync(historyPath, JSON.stringify(history));
}

async function syncHistory() {
  ensureDataDir();
  let history = readHistory();
  const seen = new Set(history.map(h => h.round));
  let maxRound = 0;
  history.forEach(h => { if (h.round > maxRound) maxRound = h.round; });
  let round = maxRound + 1;
  let added = 0;
  // 선형 증가로 최신 회차까지 수집(주 1회라 비용 낮음)
  while (true) {
    const item = await fetchRound(round);
    if (!item) break;
    if (!seen.has(item.round)) {
      history.push(item);
      seen.add(item.round);
      added++;
    }
    round++;
    // 안전 가드: 과도한 루프 방지
    if (added > 3000) break;
  }
  if (added > 0) {
    // 라운드 정렬
    history.sort((a,b)=>a.round-b.round);
    writeHistory(history);
  }
  const stats = calculateStats();
  return { added, stats };
}

app.get('/lotto/stats', (req,res) => {
  try {
    ensureDataDir();
    const payload = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
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

app.post('/lotto/sync', (req,res) => {
  (async () => {
    if (ADMIN_KEY && req.header('X-ADMIN-KEY') !== ADMIN_KEY) {
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

app.get('/lotto/generate', (req,res) => {
  try {
    ensureDataDir();
    const payload = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    const top = (payload.topCombos || []).slice(0, 10);
    res.json({ combos: top });
  } catch (e) {
    res.status(500).json({ error: 'generate_error' });
  }
});

app.listen(PORT, () => {
  ensureDataDir();
  console.log(`Lotto backend listening on :${PORT}`);
});
