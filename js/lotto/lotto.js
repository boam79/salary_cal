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

async function fetchStatsOrHistory() {
  // 1순위: 백엔드 통계
  try {
    const res = await fetch('/lotto/stats', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      return { type: 'stats', data };
    }
  } catch (_) {}
  // 2순위: 로컬 스냅샷
  try {
    const res = await fetch('data/lotto-history.json', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
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

async function onGenerate() {
  try {
    // 옵션: 사전 동기화 시도
    try { await fetch('/lotto/sync', { method: 'POST' }); } catch (_) {}
    const { type, data } = await fetchStatsOrHistory();
    let combos = [];
    let metaText = '';
    if (type === 'stats' && data && Array.isArray(data.topCombos)) {
      combos = data.topCombos.slice(0, LOTTO_SETS).map(k => k.split('-').map(n=>parseInt(n,10)));
      metaText = data.meta || '';
    } else if (type === 'history' && Array.isArray(data)) {
      combos = getTopCombosFromHistory(data, LOTTO_SETS);
      metaText = '로컬 스냅샷 기준';
    } else {
      metaText = '데이터를 불러오지 못했습니다.';
    }
    renderTicketsWithCombos(combos, metaText);
    // 저장
    try { localStorage.setItem('lotto:last', JSON.stringify({ combos, meta: metaText, at: Date.now() })); } catch (_) {}
  } catch (e) {
    console.error(e);
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

document.addEventListener('DOMContentLoaded', () => {
  renderEmptyTickets();
  restoreLast();
  const genBtn = document.getElementById('lotto-generate');
  if (genBtn) genBtn.addEventListener('click', onGenerate);
  const printBtn = document.getElementById('lotto-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
  const resetBtn = document.getElementById('lotto-reset');
  if (resetBtn) resetBtn.addEventListener('click', resetLotto);
});

export {};


