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
        // 여러 RSS 피드 소스 (증권, 경제, AI, 반도체 중점)
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
            }
        ];
        
        // 여러 RSS에서 뉴스를 수집
        const allNews = await Promise.all(
            rssSources.map(source => fetchNewsFromRSS(source))
        );
        
        // 모든 뉴스를 하나의 배열로 합치고 날짜순 정렬
        const mergedNews = allNews
            .flat()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 12); // 최신 12개만 반환
        
        // 캐시 제어
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        
        return res.status(200).json({
            success: true,
            count: mergedNews.length,
            news: mergedNews
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
        
        for (const match of items) {
            const itemXml = match[1];
            
            try {
                const title = extractTag(itemXml, 'title');
                const link = extractTag(itemXml, 'link');
                const description = extractTag(itemXml, 'description');
                const pubDate = extractTag(itemXml, 'pubDate');
                const category = extractTag(itemXml, 'category') || '경제';
                
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
                console.log('News item:', {
                    title: cleanTitle,
                    description: cleanDescription.substring(0, 50),
                    link: link,
                    source: source
                });
                
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
    const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
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

