export default function handler(req, res) {
  // XML 헤더 설정 (더 명확하게)
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 현재 날짜
  const currentDate = new Date().toISOString().split('T')[0];
  
  // sitemap XML 생성 (더 표준적인 형식)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://salary-cal.vercel.app/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  // 200 상태 코드와 함께 XML 응답
  res.status(200).send(sitemap);
}
