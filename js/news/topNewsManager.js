/**
 * 종합뉴스 TOP30 매니저
 */

const topNewsManager = (() => {
  const state = {
    timer: null,
    intervalMs: 5 * 60 * 1000,
  };

  function qs(id) { return document.getElementById(id); }
  function show(el) { if (el) el.style.display = 'block'; }
  function hide(el) { if (el) el.style.display = 'none'; }

  async function init() {
    await load();
    startAuto();
  }

  async function load() {
    show(qs('topnews-loading'));
    hide(qs('topnews-error'));
    try {
      const data = await fetchTopNews();
      render(data || []);
    } catch (e) {
      console.warn('TOP30 뉴스 로드 실패', e);
      if (window.ErrorLogger) window.ErrorLogger.log(e, 'TOP30 뉴스 로드 실패');
      qs('topnews-error').textContent = '뉴스를 불러오지 못했습니다.';
      show(qs('topnews-error'));
    } finally {
      hide(qs('topnews-loading'));
    }
  }

  async function fetchTopNews() {
    const res = await fetch('/api/news?top=30&category=all');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json?.items || json?.news || [];
  }

  function render(items) {
    const grid = qs('topnews-grid');
    grid.innerHTML = '';
    items.forEach(n => grid.appendChild(createCard(n)));
    show(grid);
  }

  function createCard(news) {
    const a = document.createElement('a');
    a.className = 'news-card';
    a.href = news.link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    // 썸네일 (없으면 도메인 파비콘 또는 플레이스홀더)
    const img = document.createElement('img');
    img.className = 'news-card-image';
    const fallbackFavicon = news?.link ? `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(news.link)}` : '';
    if (hasImage(news?.image)) {
      img.src = news.image;
      // 원본 이미지 로드 실패 시에만 파비콘으로 교체
      img.onerror = () => { if (fallbackFavicon) img.src = fallbackFavicon; };
    } else {
      img.src = fallbackFavicon;
    }
    img.alt = news.title || 'thumbnail';
    a.appendChild(img);

    const header = document.createElement('div');
    header.className = 'news-card-header';
    header.textContent = `${news.source || ''} · ${formatDate(news.pubDate)}`.trim();
    a.appendChild(header);

    const title = document.createElement('div');
    title.className = 'news-card-title';
    title.textContent = news.title || '(제목 없음)';
    a.appendChild(title);

    return a;
  }

  function hasImage(url) {
    return !!url && /^(https?:)?\/\//.test(url);
  }

  function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${mm}/${dd}`;
  }

  function startAuto() {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(load, state.intervalMs);
  }

  function cleanup() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  return { init, cleanup };
})();

export default topNewsManager;
