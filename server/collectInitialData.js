import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const outputPath = path.join(__dirname, 'data', 'lotto-history-initial.json');

async function fetchRound(round) {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0',
    }
  });
  if (!res.ok) return null;
  const j = await res.json();
  if (!j || j.returnValue !== 'success') return null;
  const numbers = [j.drwtNo1, j.drwtNo2, j.drwtNo3, j.drwtNo4, j.drwtNo5, j.drwtNo6].map(n=>parseInt(n,10)).filter(Boolean);
  if (numbers.length !== 6) return null;
  return { round: j.drwNo, date: j.drwNoDate, numbers };
}

async function findLatestRound() {
  console.log('🔍 Finding latest round...');
  
  // 최신 회차 찾기
  for (let tryRound = 1200; tryRound >= 1150; tryRound--) {
    const item = await fetchRound(tryRound);
    if (item) {
      console.log(`✅ Found latest round: ${tryRound}`);
      return tryRound;
    }
    if (tryRound % 10 === 0) console.log(`   Trying ${tryRound}...`);
    await new Promise(res => setTimeout(res, 50));
  }
  console.log('⚠️ Could not find latest round, using fallback 1196');
  return 1196;
}

async function collectData(startRound, endRound = 1) {
  // 기존 데이터 로드
  let history = [];
  if (fs.existsSync(outputPath)) {
    try {
      history = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      console.log(`📂 Loaded ${history.length} existing rounds`);
    } catch (e) {}
  }
  
  const existingRounds = new Set(history.map(h => h.round));
  const count = startRound - endRound + 1;
  console.log(`📦 Collecting ${count} rounds from ${startRound} to ${endRound}...`);
  
  let collected = 0;
  for (let i = 0; i < count; i++) {
    const round = startRound - i;
    
    // 이미 있으면 스킵
    if (existingRounds.has(round)) {
      if ((i + 1) % 500 === 0) console.log(`   Skipped ${i + 1}/${count} (already exists)`);
      continue;
    }
    
    const item = await fetchRound(round);
    
    if (item) {
      history.push(item);
      collected++;
      if (collected % 50 === 0) {
        console.log(`   Collected ${collected} new rounds (current: ${round})`);
      }
    } else {
      if (round > 1000) { // 1000회 이하는 데이터 없을 수 있음
        console.warn(`   ⚠️ Round ${round} not found`);
      }
    }
    
    // API 부하 방지 (50ms 지연으로 빠르게)
    if (i % 5 === 0) await new Promise(res => setTimeout(res, 50));
  }
  
  // 회차순으로 정렬
  history.sort((a, b) => a.round - b.round);
  console.log(`✅ Total collected: ${collected} new rounds, ${history.length} total`);
  return history;
}

async function main() {
  console.log('🎲 로또 전체 데이터 수집 시작');
  console.log('═══════════════════════════════════════');
  
  try {
    // 1. 최신 회차 찾기
    const latestRound = await findLatestRound();
    
    // 2. 전체 회차 수집 (최신 → 1회)
    const history = await collectData(latestRound, 1);
    
    // 3. 파일 저장
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(history, null, 2));
    
    console.log('═══════════════════════════════════════');
    console.log(`✅ 완료: ${history.length}회차 수집`);
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log(`📊 파일 크기: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    console.log('═══════════════════════════════════════');
    
    // 4. 샘플 출력
    if (history.length > 0) {
      console.log('\n📋 샘플 데이터 (처음 3개):');
      history.slice(0, 3).forEach(item => {
        console.log(`  ${item.round}회: [${item.numbers.join(', ')}]`);
      });
    }
    
  } catch (e) {
    console.error('❌ 에러:', e.message);
    process.exit(1);
  }
}

main().then(() => {
  process.exit(0);
});

