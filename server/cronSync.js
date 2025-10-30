import fetch from 'node-fetch';

const ADMIN_KEY = process.env.ADMIN_KEY || '';
const BASE_URL = process.env.LOTTO_BASE_URL
  || process.env.RENDER_EXTERNAL_URL
  || 'https://salary-cal.onrender.com';

async function main() {
  const syncUrl = `${BASE_URL}/lotto/sync`;
  const statsUrl = `${BASE_URL}/lotto/stats`;
  console.log('[cron] start', { BASE_URL });
  try {
    const headers = ADMIN_KEY ? { 'X-ADMIN-KEY': ADMIN_KEY } : {};
    const res = await fetch(syncUrl, { method: 'POST', headers });
    const txt = await res.text();
    console.log('[cron] sync status', res.status, txt);
  } catch (e) {
    console.error('[cron] sync error', e);
  }
  try {
    const res2 = await fetch(statsUrl);
    const txt2 = await res2.text();
    console.log('[cron] stats status', res2.status, txt2.slice(0, 120));
  } catch (e) {
    console.error('[cron] stats error', e);
  }
}

main().then(() => {
  console.log('[cron] done');
  process.exit(0);
});
