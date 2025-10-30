/**
 * RSS 뉴스 피드 API (Vercel Serverless Function)
 * 한국 경제 뉴스 RSS를 파싱하여 JSON으로 반환
 */

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // 카테고리 매핑 포함 종합뉴스 소스
        const rssSources = [
            // 증권 뉴스
            {
                name: '한국경제 증권',
                url: 'https://www.hankyung.com/rss/stock.xml'
            },
            {
                name: '매일경제 증권',
                url: 'https://www.mk.co.kr/rss/30000001/'
            },
            {
                name: '머니투데이 증권',
                url: 'https://www.mt.co.kr/rss/50000001/'
            },
            // 경제 뉴스
            {
                name: '연합뉴스 경제',
                url: 'https://www.yna.co.kr/rss/economy.xml'
            },
            {
                name: '한국경제 경제',
                url: 'https://www.hankyung.com/rss/economy.xml'
            },
            // IT/AI 뉴스
            {
                name: 'ZDNet AI',
                url: 'https://www.zdnet.co.kr/rss/all.xml'
            },
            {
                name: 'ITWorld AI',
                url: 'https://www.itworld.co.kr/rss/ai'
            },
            // 반도체 뉴스
            {
                name: '전자신문 반도체',
                url: 'https://www.etnews.com/rss/section.html?id1=06'
            },
            {
                name: '디지털타임스 IT',
                url: 'https://www.dt.co.kr/rss/all.xml'
            },
            // 종합뉴스(정치/사회/국제 등)
            { name: '연합뉴스 전체', url: 'https://www.yna.co.kr/feed/' },
            { name: 'KBS 최신뉴스', url: 'https://news.kbs.co.kr/rss/news/justIn.xml' },
            { name: 'MBC 뉴스', url: 'https://imnews.imbc.com/rss/news/news_00.xml' },
            { name: 'SBS 뉴스', url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=01' },
            { name: 'JTBC 뉴스', url: 'https://fs.jtbc.co.kr/RSS/newsflash.xml' },
            { name: '한겨레', url: 'https://www.hani.co.kr/rss/' },
            { name: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/kh_total.xml' },
            { name: '조선일보', url: 'https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml' },
            { name: '중앙일보', url: 'https://www.joongang.co.kr/rss' },
            { name: '동아일보', url: 'https://www.donga.com/news/rss' },
            { name: '한국일보', url: 'https://www.hankookilbo.com/rss/all.xml' },
        ];
        
        const url = new URL(req.url, `http://${req.headers.host}`);
        const top = Math.min(parseInt(url.searchParams.get('top') || '30', 10), 50);
        const category = url.searchParams.get('category') || 'economy';

        // 수집
        const allNews = await Promise.all(rssSources.map(source => fetchNewsFromRSS(source)));
        const merged = allNews.flat();

        // 랭킹(신선도+소스 가중), 중복 제거
        const ranked = rankAndSelect(merged, top);
        
        // 캐시 제어
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        
        return res.status(200).json({
            success: true,
            count: ranked.length,
            news: ranked
        });
        
    } catch (error) {
        console.error('❌ RSS 피드 가져오기 실패:', error);
        
        return res.status(500).json({
            success: false,
            error: '뉴스를 불러올 수 없습니다.',
            message: error.message
        });
    }
}

// 간단 랭킹 + 중복 제거
function rankAndSelect(items, top) {
    const now = Date.now();
    const tau = 2 * 60 * 60 * 1000; // 2h
    const srcW = {
        '연합뉴스 전체': 1.08, '연합뉴스 경제': 1.07, 'KBS 최신뉴스': 1.06, 'MBC 뉴스': 1.05,
        'SBS 뉴스': 1.05, 'JTBC 뉴스': 1.04, '뉴시스': 1.03
    };
    const seen = new Set();
    const scored = [];
    for (const it of items) {
        const key = ((it.link||'').replace(/[#?].*$/, '') + '|' + (it.title||'').trim());
        if (seen.has(key)) continue;
        seen.add(key);
        const t = new Date(it.date || it.pubDate || Date.now()).getTime();
        const rec = Math.exp(-(now - t) / tau);
        const sw = srcW[it.source] || 1.0;
        const score = 0.7 * rec + 0.3 * (sw / 1.1);
        scored.push({ ...it, score });
    }
    scored.sort((a,b) => b.score - a.score);
    return scored.slice(0, top);
}

// RSS 피드에서 뉴스 가져오기
async function fetchNewsFromRSS(source) {
    try {
        const response = await fetch(source.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            next: { revalidate: 300 } // 5분 캐시
        });
        
        if (!response.ok) {
            console.warn(`⚠️ RSS 피드 로드 실패 (${source.name}):`, response.status);
            return [];
        }
        
        const xmlText = await response.text();
        const news = parseRSSFeed(xmlText, source.name);
        
        return news;
        
    } catch (error) {
        console.error(`❌ RSS 피드 파싱 오류 (${source.name}):`, error);
        return [];
    }
}

// RSS XML 파싱
function parseRSSFeed(xmlText, source) {
    const news = [];
    
    try {
        // 간단한 XML 파싱 (정규식 기반)
        // 실제로는 XML 파서 라이브러리를 사용하는 것이 좋습니다
        
        // item 태그 추출
        const itemRegex = /<item>(.*?)<\/item>/gs;
        const items = [...xmlText.matchAll(itemRegex)];
        
        console.log(`📰 RSS 피드 파싱: ${items.length}개 항목 발견 (${source.name})`);
        
        // 디버깅: 첫 번째 item 샘플
        if (items.length > 0) {
            console.log('📰 첫 번째 item 샘플:', items[0][1].substring(0, 500));
        }
        
        for (const match of items) {
            const itemXml = match[1];
            
            try {
                // RSS 2.0과 Atom 피드 모두 지원
                const title = extractTag(itemXml, 'title') || extractTag(itemXml, 'atom:title');
                const link = extractTag(itemXml, 'link') || extractTag(itemXml, 'atom:link');
                const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'atom:summary') || extractTag(itemXml, 'atom:content');
                const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'atom:published') || extractTag(itemXml, 'atom:updated');
                const category = extractTag(itemXml, 'category') || extractTag(itemXml, 'atom:category') || '경제';
                
                // 이미지 추출 시도 (여러 패턴 시도)
                let image = null;
                
                // 1. enclosure 태그에서 추출
                const enclosureRegex = /<enclosure[^>]*url="([^"]+)"/i;
                const enclosureMatch = itemXml.match(enclosureRegex);
                if (enclosureMatch) image = enclosureMatch[1];
                
                // 2. media:content 태그에서 추출
                if (!image) {
                    const mediaContentRegex = /<media:content[^>]*url="([^"]+)"/i;
                    const mediaMatch = itemXml.match(mediaContentRegex);
                    if (mediaMatch) image = mediaMatch[1];
                }
                
                // 3. description 내 img 태그에서 추출
                if (!image && description) {
                    const imgRegex = /<img[^>]*src="([^"]+)"/i;
                    const imgMatch = description.match(imgRegex);
                    if (imgMatch) image = imgMatch[1];
                }
                
                // 4. thumbnail 태그에서 추출
                if (!image) {
                    const thumbnailRegex = /<thumbnail[^>]*url="([^"]+)"/i;
                    const thumbnailMatch = itemXml.match(thumbnailRegex);
                    if (thumbnailMatch) image = thumbnailMatch[1];
                }
                
                // 제목과 설명에서 HTML 태그 제거
                const cleanTitle = removeHtmlTags(title || '');
                // description에서 이미지를 제거한 순수 텍스트만 가져오기
                const cleanDescription = removeHtmlTags((description || '').replace(/<img[^>]*>/gi, ''));
                
                // 디버깅: 실제 데이터 확인
                // console.log('News item:', { title: cleanTitle, link, source });
                
                if (title && link && description) {
                    news.push({
                        id: generateId(link),
                        title: cleanTitle,
                        description: cleanDescription.substring(0, 200), // 200자 제한
                        source: source,
                        date: parseDate(pubDate),
                        category: category,
                        link: link,
                        image: image
                    });
                }
            } catch (error) {
                console.error('뉴스 항목 파싱 오류:', error);
            }
        }
        
    } catch (error) {
        console.error('RSS 피드 전체 파싱 오류:', error);
    }
    
    return news;
}

// XML 태그 내용 추출
function extractTag(xml, tagName) {
    // 1. CDATA 섹션이 있는 경우
    const cdataRegex = new RegExp(`<${tagName}>\\s*<!\\[CDATA\\[(.*?)\\]\\]>\\s*<\/${tagName}>`, 'i');
    const cdataMatch = xml.match(cdataRegex);
    if (cdataMatch) {
        return cdataMatch[1].trim();
    }
    
    // 2. 일반 태그
    const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = xml.match(regex);
    const content = match ? match[1].trim() : '';
    
    // 3. 디버깅: 빈 값인 경우 로그
    if (tagName === 'title' && !content) {
        console.warn('⚠️ title이 빈 값입니다. XML 샘플:', xml.substring(0, 500));
    }
    
    return content;
}

// HTML 태그 제거
function removeHtmlTags(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
}

// 날짜 파싱
function parseDate(dateString) {
    if (!dateString) return new Date().toISOString();
    
    try {
        // RFC 2822 형식 파싱 시도
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    } catch (error) {
        console.error('날짜 파싱 오류:', error);
    }
    
    return new Date().toISOString();
}

// ID 생성
function generateId(link) {
    return link.split('/').slice(-2).join('-').replace(/[^a-zA-Z0-9-]/g, '');
}

