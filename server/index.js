import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';

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
  const numberFreq = Array(46).fill(0);
  for (const row of history) {
    if (!row || !Array.isArray(row.numbers) || row.numbers.length !== 6) continue;
    const key = buildComboKey(row.numbers);
    freq.set(key, (freq.get(key) || 0) + 1);
    for (const n of row.numbers) {
      if (Number.isInteger(n) && n>=1 && n<=45) numberFreq[n]++;
    }
  }
  const topCombos = Array.from(freq.entries()).sort((a,b)=>b[1]-a[1]).slice(0, 50).map(([k])=>k);
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    topCombos,
    numberFreq,
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

async function fetchRoundHtml(round) {
  // round=0 또는 undefined이면 최신 회차 페이지에서 추출
  const url = round
    ? `https://www.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${round}`
    : `https://www.dhlottery.co.kr/gameResult.do?method=byWin`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.dhlottery.co.kr/common.do?method=main',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });
  if (!res.ok) return null;
  const html = await res.text();
  const $ = cheerio.load(html);
  // 회차 파싱: 페이지 내 "제 xxxx회" 또는 input[name=drwNo]
  let parsedRound = round;
  const titleText = $('div.win_result h4 strong').text() || $('h4').text() || $('title').text();
  const m = titleText.match(/([0-9]{3,5})\s*회/);
  if ((!parsedRound || parsedRound === 0) && m) parsedRound = parseInt(m[1], 10);
  const inputVal = $('input[name="drwNo"]').val();
  if ((!parsedRound || parsedRound === 0) && inputVal) parsedRound = parseInt(inputVal, 10);
  // 번호 파싱: 공통 클래스(ball) 기반 선택자들 시도
  let nums = [];
  $('span.ball_645, .win_result .num .ball, .lotto_win_number .ball').each((_, el) => {
    const t = $(el).text().trim();
    const n = parseInt(t, 10);
    if (!isNaN(n)) nums.push(n);
  });
  if (nums.length < 6) {
    // fallback: 모든 숫자 추출 후 1~45 범위 6개만 선택
    const texts = $('body').text();
    const all = (texts.match(/\b([1-9]|[1-3][0-9]|4[0-5])\b/g) || []).map(s=>parseInt(s,10));
    nums = all.slice(0,6);
  }
  nums = nums.slice(0,6);
  if (!parsedRound || nums.length !== 6) return null;
  return { round: parsedRound, date: '', numbers: nums };
}

async function fetchLatestRoundHtml() {
  const item = await fetchRoundHtml(0);
  return item?.round || 0;
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
  let added = 0;
  // 최신 회차 파악(HTML 기준)
  const latest = await fetchLatestRoundHtml();
  if (latest && latest > maxRound) {
    for (let r = latest; r > maxRound; r--) {
      let item = await fetchRound(r);
      if (!item) {
        item = await fetchRoundHtml(r);
      }
      if (item && !seen.has(item.round)) {
        history.push(item);
        seen.add(item.round);
        added++;
      }
      if (added > 1000) break; // 안전 가드
      await new Promise(res=>setTimeout(res, 300 + Math.random()*300));
    }
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

function weightedPickOne(weight) {
  const sum = weight.reduce((a,b)=>a+b, 0);
  if (sum <= 0) return null;
  let r = Math.random() * sum;
  for (let i=1;i<weight.length;i++) {
    r -= weight[i];
    if (r <= 0) return i;
  }
  return 45;
}

function generateUniqueSet(numberFreq, existingComboKeys) {
  const base = numberFreq.slice();
  for (let i=1;i<=45;i++) base[i] = Math.max(1, base[i] || 1);
  const chosen = new Set();
  let guard = 0;
  while (chosen.size < 6 && guard < 200) {
    // 매 호출마다 약간의 난수(jitter)로 다양성 확보
    const w = base.slice().map((v, idx) => idx === 0 ? 0 : v + Math.random()*0.5);
    for (const n of chosen) w[n] = 0;
    const pick = weightedPickOne(w);
    if (pick && pick>=1 && pick<=45) chosen.add(pick);
    guard++;
  }
  const arr = Array.from(chosen).sort((a,b)=>a-b);
  const key = buildComboKey(arr);
  if (arr.length !== 6 || existingComboKeys.has(key)) return null;
  return arr;
}

app.get('/lotto/generate', (req,res) => {
  try {
    ensureDataDir();
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    const existing = new Set(history.map(h => buildComboKey(h.numbers)));
    const result = [];
    let tries = 0;
    while (result.length < 10 && tries < 1000) {
      const set = generateUniqueSet(stats.numberFreq || [], existing);
      if (set) {
        result.push(set);
        existing.add(buildComboKey(set));
      }
      tries++;
    }
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json({ generated: result, updatedAt: stats.updatedAt, total: history.length, seed: Date.now() });
  } catch (e) {
    console.error('[lotto-backend] generate error', e);
    res.status(500).json({ error: 'generate_error' });
  }
});

app.listen(PORT, () => {
  ensureDataDir();
  console.log(`Lotto backend listening on :${PORT}`);
});
