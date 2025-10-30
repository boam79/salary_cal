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
  try {
    if (ADMIN_KEY && req.header('X-ADMIN-KEY') !== ADMIN_KEY) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    ensureDataDir();
    // TODO: 실제 소스에서 최신 회차 수집/병합. 현재는 no-op.
    const payload = calculateStats();
    console.log('[lotto-backend] sync completed', payload.updatedAt, 'topCombos=', payload.topCombos.length);
    res.json({ ok: true, updatedAt: payload.updatedAt });
  } catch (e) {
    console.error('[lotto-backend] sync error', e);
    res.status(500).json({ error: 'sync_error' });
  }
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
