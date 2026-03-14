import { useEffect, useState } from 'react';
import { bookingApi } from '../api';
import type { Booking } from '../@types';
import { TOKEN_KEY } from '../utils/constants';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getAll();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      fetchBookings();
    }
  }, []);

  const byHour = new Map<string, number>();
  for (const b of bookings) {
    const total = b.adultTickets + b.childTickets + b.seniorTickets + b.studentTickets;
    byHour.set(b.timeSlot, (byHour.get(b.timeSlot) || 0) + total);
  }

  return { bookings, loading, error, refetch: fetchBookings, byHour };
}
