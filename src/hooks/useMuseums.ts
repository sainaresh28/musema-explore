import { useEffect, useState } from 'react';
import { museumApi } from '../api';
import type { Museum } from '../@types';

export function useMuseums(params?: Record<string, string>) {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    museumApi.getAll(params)
      .then((data) => setMuseums(data.museums || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { museums, loading, error };
}

export function useMuseum(id: string) {
  const [museum, setMuseum] = useState<Museum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    museumApi.getById(id)
      .then((data) => setMuseum(data.museum))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { museum, loading, error };
}
