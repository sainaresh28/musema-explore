import http from './client';
import type { Museum, PaginationMeta } from '../@types';

export const museumApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return http.get<{ museums: Museum[]; pagination: PaginationMeta }>(`/museums${qs}`);
  },
  getById: (id: string) => http.get<{ museum: Museum }>(`/museums/${id}`),
  getTypes:  () => http.get<{ types: string[] }>('/museums/types'),
  getStates: () => http.get<{ states: string[] }>('/museums/states'),
};

export interface LLMMuseum {
  _id?: string;
  name: string;
  city: string;
  state: string;
  address: string;
  description: string;
  type: string;
  establishedYear: number | null;
  openingHours: string;
  closedOn: string;
  website: string;
  ticketPrices: { adult: number; child: number; senior: number; student: number; foreign: number };
  highlights?: string[];
  nearbyAttractions?: string[];
  images?: string[];
  thumbnail?: string;
  source?: string;
}

export const llmMuseumApi = {
  /** Fetch any Indian museum's data via Groq. Caches in ExternalMuseum collection. */
  fetch: (name: string, city?: string) =>
    http.post<{ museum: LLMMuseum; fromCache: boolean }>('/llm-museum/fetch', { name, city }),
};
