// 로또 생성기 (축소 범위 MVP)

const LOTTO_SETS = 10; // A~J
const SET_LABELS = ['A','B','C','D','E','F','G','H','I','J'];

function renderEmptyTickets() {
  const container = document.getElementById('lotto-tickets');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < LOTTO_SETS; i++) {
    const ticket = document.createElement('div');
    ticket.className = 'lotto-ticket';
    ticket.innerHTML = `
      <div class="lotto-ticket-header">
        <span>세트 ${SET_LABELS[i]}</span>
      </div>
      <div class="lotto-balls">
        ${Array.from({length:6}).map(() => `<div class="lotto-ball">-</div>`).join('')}
      </div>
    `;
    container.appendChild(ticket);
  }
}

const API_BASE = typeof window !== 'undefined' && window.LOTTO_API ? window.LOTTO_API : '';

async function fetchStatsOrHistory() {
  // 1순위: 백엔드 통계
  try {
    const res = await fetch(`${API_BASE}/lotto/stats`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      console.log('[lotto] /lotto/stats ok', data);
      return { type: 'stats', data };
    }
    console.warn('[lotto] /lotto/stats http', res.status);
  } catch (_) {}
  // 2순위: 로컬 스냅샷
  try {
    const res = await fetch('data/lotto-history.json', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      console.log('[lotto] local history ok length=', Array.isArray(data)?data.length:0);
      return { type: 'history', data };
    }
  } catch (_) {}
  return { type: 'none', data: null };
}

function buildComboKey(nums) {
  const arr = [...nums].sort((a,b)=>a-b);
  return arr.join('-');
}

function getTopCombosFromHistory(history, limit = 10) {
  // history: [{ draw: 1, numbers: [n1..n6] }, ...]
  const freq = new Map();
  const seenCombos = new Set();
  for (const row of history) {
    if (!row || !Array.isArray(row.numbers) || row.numbers.length !== 6) continue;
    const key = buildComboKey(row.numbers);
    seenCombos.add(key);
    freq.set(key, (freq.get(key) || 0) + 1);
  }
  // 정렬
  const sorted = Array.from(freq.entries()).sort((a,b)=> b[1]-a[1]);
  // 과거 당첨과 동일 조합 제외 → 사실상 상위 자체가 모두 과거 조합이므로,
  // 요구사항 해석에 따라: 동일 조합 재표시는 금지 → 상위에서 중복 제거만 하고 그대로 사용
  const unique = [];
  const used = new Set();
  for (const [key] of sorted) {
    if (used.has(key)) continue;
    used.add(key);
    unique.push(key);
    if (unique.length >= limit) break;
  }
  // 키를 숫자 배열로 반환
  return unique.map(k => k.split('-').map(n=>parseInt(n,10)));
}

function renderTicketsWithCombos(combos, meta) {
  const container = document.getElementById('lotto-tickets');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < LOTTO_SETS; i++) {
    const nums = combos[i] || [];
    const ticket = document.createElement('div');
    ticket.className = 'lotto-ticket';
    const balls = nums.map(n=>`<div class="lotto-ball marked">${n}</div>`).join('');
    const blanks = Array.from({length: Math.max(0, 6-nums.length)}).map(()=>`<div class="lotto-ball">-</div>`).join('');
    ticket.innerHTML = `
      <div class="lotto-ticket-header">
        <span>세트 ${SET_LABELS[i]}</span>
      </div>
      <div class="lotto-balls">${balls}${blanks}</div>
    `;
    container.appendChild(ticket);
  }
  const metaEl = document.getElementById('lotto-meta');
  if (metaEl) metaEl.textContent = meta || '';
}

function setLoading(isLoading) {
  const btn = document.getElementById('lotto-generate');
  if (btn) {
    btn.disabled = isLoading;
    btn.textContent = isLoading ? '생성 중...' : '생성 (최신 동기화 포함)';
  }
}

async function onGenerate() {
  try {
    setLoading(true);
    // 사전 동기화: 지연을 막기 위해 대기하지 않고 백그라운드 요청
    try { fetch(`${API_BASE}/lotto/sync`, { method: 'POST' }); } catch (e) { console.warn('[lotto] sync error (ignored)', e); }
    // 새로운 생성 API 사용(가중치 기반, 과거 조합 제외)
    let combos = [];
    let metaText = '';
    try {
      const res = await fetch(`${API_BASE}/lotto/generate?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.generated)) {
          combos = data.generated;
          metaText = `total=${data.total}`;
        }
      }
    } catch (e) {
      console.warn('[lotto] /lotto/generate error', e);
    }
    if (!combos.length) {
      // 백업 경로: 기존 통계/히스토리 활용
      const { type, data } = await fetchStatsOrHistory();
      if (type === 'stats' && data && Array.isArray(data.topCombos)) {
        combos = data.topCombos.slice(0, LOTTO_SETS).map(k => k.split('-').map(n=>parseInt(n,10)));
        metaText = data.meta || '';
      } else if (type === 'history' && Array.isArray(data)) {
        combos = getTopCombosFromHistory(data, LOTTO_SETS);
        metaText = '로컬 스냅샷 기준';
      } else {
        metaText = '데이터를 불러오지 못했습니다.';
        if (window.ErrorLogger?.log) {
          window.ErrorLogger.log('Lotto Fetch Failed', { apiBase: API_BASE });
        }
      }
    }
    renderTicketsWithCombos(combos, metaText);
    try { localStorage.setItem('lotto:last', JSON.stringify({ combos, meta: metaText, at: Date.now() })); } catch (_) {}
  } catch (e) {
    console.error('[lotto] generate error', e);
    if (window.ErrorLogger?.log) {
      window.ErrorLogger.log('Lotto Generate Error', { message: e?.message, stack: e?.stack });
    }
  } finally {
    setLoading(false);
  }
}

function restoreLast() {
  try {
    const raw = localStorage.getItem('lotto:last');
    if (!raw) return;
    const { combos, meta } = JSON.parse(raw);
    if (Array.isArray(combos)) renderTicketsWithCombos(combos, meta);
  } catch (_) {}
}

function resetLotto() {
  try { localStorage.removeItem('lotto:last'); } catch (_) {}
  renderEmptyTickets();
  const metaEl = document.getElementById('lotto-meta');
  if (metaEl) metaEl.textContent = '';
}

function init() {
  renderEmptyTickets();
  restoreLast();
  const genBtn = document.getElementById('lotto-generate');
  if (genBtn) genBtn.addEventListener('click', onGenerate);
  const resetBtn = document.getElementById('lotto-reset');
  if (resetBtn) resetBtn.addEventListener('click', resetLotto);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};


