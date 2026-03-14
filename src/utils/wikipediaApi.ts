// Wikipedia APId
const WIKI_API = 'https://en.wikipedia.org/api/rest_v1';
const WIKI_SEARCH = 'https://en.wikipedia.org/w/api.php';

export interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: string;
  url: string;
}

export const wikipediaApi = {
  // Search and get summary for a museum
  getSummary: async (query: string): Promise<WikiSummary | null> => {
    try {
      // First search for the page
      const searchRes = await fetch(
        `${WIKI_SEARCH}?action=query&list=search&srsearch=${encodeURIComponent(query + ' museum India')}&format=json&origin=*&srlimit=1`
      );
      const searchData = await searchRes.json();
      const pages = searchData?.query?.search;
      if (!pages?.length) return null;

      const title = pages[0].title;

      // Get full summary
      const summaryRes = await fetch(
        `${WIKI_API}/page/summary/${encodeURIComponent(title)}`
      );
      const summary = await summaryRes.json();

      return {
        title: summary.title,
        extract: summary.extract || '',
        thumbnail: summary.thumbnail?.source,
        url: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
      };
    } catch {
      return null;
    }
  },

  // Get sections of a Wikipedia article
  getSections: async (title: string): Promise<string> => {
    try {
      const res = await fetch(
        `${WIKI_SEARCH}?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(title)}&format=json&origin=*`
      );
      const data = await res.json();
      const pages = data?.query?.pages;
      if (!pages) return '';
      const page = Object.values(pages)[0] as any;
      return page?.extract?.slice(0, 1500) || '';
    } catch {
      return '';
    }
  }
};
