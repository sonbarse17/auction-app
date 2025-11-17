import axios from 'axios';
import type { User, Tournament, Team, Player, Auction, AuctionSnapshot } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; token_type: string; user: User }>('/auth/login', { email, password }),
  
  register: (email: string, password: string, full_name: string) =>
    api.post<User>('/auth/register', { email, password, full_name }),
  
  me: () => api.get<User>('/auth/me'),
  
  updateProfile: (data: { full_name?: string; profile_photo?: string }) =>
    api.patch<User>('/auth/me', data),
  
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ photo_url: string }>('/auth/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Tournaments
export const tournamentApi = {
  list: () => api.get<Tournament[]>('/tournaments'),
  get: (id: number) => api.get<Tournament>(`/tournaments/${id}`),
  create: (data: Partial<Tournament>) => api.post<Tournament>('/tournaments', data),
  update: (id: number, data: Partial<Tournament>) => api.patch<Tournament>(`/tournaments/${id}`, data),
};

// Teams
export const teamApi = {
  list: (tournamentId: number) => api.get<Team[]>(`/teams/tournament/${tournamentId}`),
  listMyTeams: () => api.get<Team[]>('/teams/my-teams'),
  get: (id: number) => api.get<Team>(`/teams/${id}`),
  create: (data: Partial<Team>) => api.post<Team>('/teams', data),
};

// Players
export const playerApi = {
  list: () => api.get<Player[]>('/players'),
  get: (id: number) => api.get<Player>(`/players/${id}`),
  create: (data: Partial<Player>) => api.post<Player>('/players', data),
  update: (id: number, data: Partial<Player>) => api.patch<Player>(`/players/${id}`, data),
  delete: (id: number) => api.delete(`/players/${id}`),
};

// Auctions
export const auctionApi = {
  get: (id: number) => api.get<Auction>(`/auctions/${id}`),
  snapshot: (id: number) => api.get<AuctionSnapshot>(`/auctions/${id}/snapshot`),
  create: (data: { tournament_id: number; name: string; timer_seconds: number; player_ids: number[] }) =>
    api.post<Auction>('/auctions', data),
  start: (id: number) => api.post(`/auctions/${id}/start`),
  pause: (id: number) => api.post(`/auctions/${id}/pause`),
  resume: (id: number) => api.post(`/auctions/${id}/resume`),
  next: (id: number) => api.post(`/auctions/${id}/next`),
  complete: (id: number) => api.post(`/auctions/${id}/complete`),
};

// Auto-bids
export const autoBidApi = {
  create: (data: { auction_id: number; player_id: number; team_id: number; max_amount: number }) =>
    api.post('/auto-bids', data),
  deactivate: (auctionId: number, playerId: number, teamId: number) =>
    api.delete(`/auto-bids/${auctionId}/${playerId}/${teamId}`),
};

// Admin
export const adminApi = {
  listUsers: () => api.get<User[]>('/admin/users'),
  deleteUser: (userId: number) => api.delete(`/admin/users/${userId}`),
  approveUser: (userId: number) => api.post(`/admin/users/${userId}/approve`),
  updateRoles: (userId: number, roles: string[]) => api.put(`/admin/users/${userId}/roles`, roles),
};

export default api;
