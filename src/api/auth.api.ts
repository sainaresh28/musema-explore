import http from './client';

export const authApi = {

  syncUser: (data: { fullName: string; email: string }) =>
    http.post('/auth/sync', data),

  getMe: () =>
    http.get('/auth/me'),

  updateProfile: (data: any) =>
    http.patch('/auth/me', data),
};
