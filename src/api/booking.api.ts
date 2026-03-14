import http from './client';
import type { Booking, BookingPayload } from '../@types';

export const bookingApi = {
  create: (data: BookingPayload) =>
    http.post<{ booking: Booking }>('/bookings', data),
  getAll: () =>
    http.get<{ bookings: Booking[] }>('/bookings'),
  getById: (id: string) =>
    http.get<{ booking: Booking }>(`/bookings/${id}`),
  cancel: (id: string) =>
    http.patch(`/bookings/${id}/cancel`, {}),
  getBusyTimes: () =>
    http.get<{ stats: Array<{ _id: string; totalVisitors: number }> }>(
      '/bookings/stats/busy-times'
    ),
};
