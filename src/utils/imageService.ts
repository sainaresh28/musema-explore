const POOL: Record<string, string[]> = {
  Art: [
    'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=700&q=80',
    'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=700&q=80',
    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=700&q=80',
    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=700&q=80',
    'https://images.unsplash.com/photo-1604503468506-a8da13d11f34?w=700&q=80',
  ],
  History: [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=700&q=80',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=700&q=80',
  ],
  Science: [
    'https://images.unsplash.com/photo-1532094349884-543559242c50?w=700&q=80',
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=700&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80',
    'https://images.unsplash.com/photo-1576669801775-ff43c5ab079d?w=700&q=80',
    'https://images.unsplash.com/photo-1559304822-9eb2813c9e3b?w=700&q=80',
  ],
  'Natural History': [
    'https://images.unsplash.com/photo-1559304822-9eb2813c9e3b?w=700&q=80',
    'https://images.unsplash.com/photo-1576669801775-ff43c5ab079d?w=700&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=80',
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=700&q=80',
  ],
  Cultural: [
    'https://images.unsplash.com/photo-1509909756405-be0199881695?w=700&q=80',
    'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=700&q=80',
    'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=700&q=80',
    'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=700&q=80',
  ],
  Tribal: [
    'https://images.unsplash.com/photo-1509909756405-be0199881695?w=700&q=80',
    'https://images.unsplash.com/photo-1604503468506-a8da13d11f34?w=700&q=80',
    'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=700&q=80',
  ],
  Archaeological: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=700&q=80',
    'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=700&q=80',
  ],
  Military: [
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=700&q=80',
    'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=700&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=80',
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=700&q=80',
    'https://images.unsplash.com/photo-1569949380901-56a3d2a7657e?w=700&q=80',
  ],
  Railway: [
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=700&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&q=80',
  ],
  General: [
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=700&q=80',
    'https://images.unsplash.com/photo-1596623505984-4d89c21b7de3?w=700&q=80',
    'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=700&q=80',
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=700&q=80',
  ],
};

export function getMuseumImages(
  museum: { name?: string; type?: string; images?: string[]; thumbnail?: string },
  count = 3
): string[] {
  if (museum.images && museum.images.length > 0) return museum.images.slice(0, count);
  const type = museum.type || 'General';
  const pool = POOL[type] || POOL.General;
  // Deterministic shuffle from museum name — stable seeded Fisher-Yates
  const seed = (museum.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 2654435761) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function getMuseumThumbnail(
  museum: { name?: string; type?: string; images?: string[]; thumbnail?: string }
): string {
  if (museum.thumbnail) return museum.thumbnail;
  if (museum.images?.[0]) return museum.images[0];
  return getMuseumImages(museum, 1)[0];
}


const WIKI_API = 'https://en.wikipedia.org/w/api.php';

const JUNK_PATTERN = /logo|icon|flag|map|coat|seal|blank|signature|stamp|arrow|button|symbol|commons-logo|wiki/i;

export async function fetchMuseumImages(
  museum: { name?: string; city?: string; type?: string; images?: string[] },
  count = 3
): Promise<string[]> {
  // If museum already has seeded images, use them immediately
  if (museum.images && museum.images.length > 0) return museum.images.slice(0, count);

  const name = museum.name || '';
  const city = museum.city || '';

  // If no name, skip Wikipedia and return pool fallback right away
  if (!name) return getMuseumImages(museum, count);

  try {
    // ── Step 1: Find the Wikipedia article ───────────────────────
    const searchQuery = city ? `${name} ${city}` : `${name} India`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
    const searchRes = await fetch(
      `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*&srlimit=3`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    const searchData = await searchRes.json();
    const results: any[] = searchData?.query?.search || [];

    // Pick the best matching result — prefer title that contains museum name words
    const nameWords = name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const pageTitle =
      results.find(r => nameWords.every(w => r.title.toLowerCase().includes(w)))?.title
      || results[0]?.title;

    if (!pageTitle) return getMuseumImages(museum, count);

    // ── Step 2: Fetch lead image + all images on the page ────────
    const articleRes = await fetch(
      `${WIKI_API}?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages|images&piprop=original&imlimit=30&format=json&origin=*`
    );
    const articleData = await articleRes.json();
    const articlePages = articleData?.query?.pages || {};
    const articlePage: any = Object.values(articlePages)[0];
    if (!articlePage) return getMuseumImages(museum, count);

    // Lead image — the infobox/main photo Wikipedia chose for this article
    const leadUrl: string | null = articlePage?.original?.source || null;

   
    const allFilenames: string[] = (articlePage?.images || [])
      .map((i: any) => i.title as string)
      .filter((t: string) =>
        /\.(jpg|jpeg|png|webp)$/i.test(t) && !JUNK_PATTERN.test(t)
      );

    if (!leadUrl && allFilenames.length === 0) return getMuseumImages(museum, count);

    // ── Step 3: Resolve filenames → URLs with dimensions ─────────
    let supportingUrls: string[] = [];
    if (allFilenames.length > 0) {
      const titles = allFilenames.slice(0, 12).join('|');
      const infoRes = await fetch(
        `${WIKI_API}?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|size&iiurlwidth=700&format=json&origin=*`
      );
      const infoData = await infoRes.json();
      const infoPages = infoData?.query?.pages || {};

      supportingUrls = Object.values(infoPages)
        .filter((p: any) => {
          const info = p?.imageinfo?.[0];
          if (!info) return false;
         
          const w = info.width || 0;
          const h = info.height || 0;
          if (w < 200 || h < 150) return false;
         
          if (h > w * 1.5) return false;
          return true;
        })
        .map((p: any) => {
          const info = p?.imageinfo?.[0];
          return info?.thumburl || info?.url;
        })
        .filter(Boolean) as string[];
    }

    // ── Step 4: Compose result — lead image first ─────────────────
    const all = leadUrl
      ? [leadUrl, ...supportingUrls.filter(u => u !== leadUrl)]
      : supportingUrls;

    if (all.length === 0) return getMuseumImages(museum, count);
    return all.slice(0, count);

  } catch {
    return getMuseumImages(museum, count);
  }
}