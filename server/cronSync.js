import fetch from 'node-fetch';

const ADMIN_KEY = process.env.ADMIN_KEY || '';
const BASE_URL = process.env.LOTTO_BASE_URL
  || process.env.RENDER_EXTERNAL_URL
  || 'https://salary-cal.onrender.com';

// 타임아웃 설정 (5분)
const TIMEOUT_MS = 5 * 60 * 1000; // 300초
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5초

/**
 * 타임아웃이 있는 fetch 래퍼
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 60000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * 재시도 로직이 있는 fetch
 */
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES, retryDelay = RETRY_DELAY) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[cron] Attempt ${attempt}/${retries} for ${url}`);
      const response = await fetchWithTimeout(url, options, TIMEOUT_MS);
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`[cron] Attempt ${attempt} failed:`, error.message);
      
      if (attempt < retries) {
        const delay = retryDelay * attempt; // 지수 백오프
        console.log(`[cron] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * 동기화 실행 (타임아웃 + 재시도 적용)
 */
async function runSync() {
  const syncUrl = `${BASE_URL}/lotto/sync`;
  console.log('[cron] Starting sync operation...');
  
  try {
    const headers = ADMIN_KEY ? { 'X-ADMIN-KEY': ADMIN_KEY } : {};
    const res = await fetchWithRetry(syncUrl, { method: 'POST', headers });
    const txt = await res.text();
    
    if (res.ok) {
      try {
        const data = JSON.parse(txt);
        console.log('[cron] ✅ Sync success:', {
          added: data.added || 0,
          updatedAt: data.updatedAt
        });
        return { success: true, added: data.added || 0 };
      } catch (e) {
        console.log('[cron] ⚠️ Sync response (non-JSON):', txt.slice(0, 100));
        return { success: res.ok, added: 0 };
      }
    } else {
      console.error('[cron] ❌ Sync failed with status:', res.status, txt.slice(0, 100));
      return { success: false, added: 0 };
    }
  } catch (e) {
    console.error('[cron] ❌ Sync error after retries:', e.message);
    return { success: false, added: 0, error: e.message };
  }
}

/**
 * 통계 확인
 */
async function checkStats() {
  const statsUrl = `${BASE_URL}/lotto/stats`;
  console.log('[cron] Checking stats...');
  
  try {
    const res = await fetchWithTimeout(statsUrl, {}, 30000); // 30초 타임아웃
    const txt = await res.text();
    
    if (res.ok) {
      try {
        const data = JSON.parse(txt);
        console.log('[cron] 📊 Stats:', {
          total: data.total || 0,
          topCombos: data.topCombos?.length || 0,
          updatedAt: data.updatedAt
        });
        return { success: true, total: data.total || 0 };
      } catch (e) {
        console.log('[cron] ⚠️ Stats response (non-JSON):', txt.slice(0, 100));
        return { success: res.ok, total: 0 };
      }
    } else {
      console.warn('[cron] ⚠️ Stats failed with status:', res.status);
      return { success: false, total: 0 };
    }
  } catch (e) {
    console.error('[cron] ⚠️ Stats error:', e.message);
    return { success: false, total: 0 };
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const startTime = Date.now();
  console.log('[cron] ════════════════════════════════════════');
  console.log('[cron] 🎲 Lotto Cron Sync Started');
  console.log('[cron] ════════════════════════════════════════');
  console.log('[cron] Config:', {
    BASE_URL,
    TIMEOUT_MS: `${TIMEOUT_MS / 1000}s`,
    MAX_RETRIES,
    HAS_ADMIN_KEY: !!ADMIN_KEY
  });
  
  // 1. 동기화 실행
  const syncResult = await runSync();
  
  // 2. 통계 확인
  const statsResult = await checkStats();
  
  // 3. 결과 요약
  const duration = Date.now() - startTime;
  console.log('[cron] ════════════════════════════════════════');
  console.log('[cron] 📋 Summary:');
  console.log('[cron]   Sync:', syncResult.success ? '✅' : '❌', 
    syncResult.success ? `${syncResult.added} rounds added` : syncResult.error);
  console.log('[cron]   Stats:', statsResult.success ? '✅' : '⚠️', 
    statsResult.success ? `${statsResult.total} total rounds` : 'Failed');
  console.log('[cron]   Duration:', `${(duration / 1000).toFixed(2)}s`);
  console.log('[cron] ════════════════════════════════════════');
  
  // 성공 여부에 따른 종료 코드
  const exitCode = syncResult.success ? 0 : 1;
  process.exit(exitCode);
}

// 에러 핸들링
main().catch(error => {
  console.error('[cron] 💥 Fatal error:', error);
  process.exit(1);
});
