
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


let getTokenFn: (() => Promise<string | null>) | null = null;

export const setTokenProvider = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

async function request<T = any>(method: string, path: string, data?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

 
  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch {
   
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Cannot reach server. Is the backend running on port 5000?');
  }

  const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) throw new Error(json.error || json.message || `Request failed (${res.status})`);
  return json;
}

export const http = {
  get:    <T = any>(path: string)                    => request<T>('GET',    path),
  post:   <T = any>(path: string, data: unknown)     => request<T>('POST',   path, data),
  patch:  <T = any>(path: string, data: unknown)     => request<T>('PATCH',  path, data),
  delete: <T = any>(path: string)                    => request<T>('DELETE', path),
};

export default http;
